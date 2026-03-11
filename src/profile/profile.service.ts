import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
  UploadedFile,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EditProfileDto } from './dto/edit-profile.dto';
import { Profile } from 'src/common/entities/profile.entity';
import { EntityManager, Repository } from 'typeorm';
import { ContactType, EditContactDto } from './dto/edit-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { DigitalRoles, Role, SocialRoles } from 'src/common/enum/role.enum';
import { Organization } from 'src/common/entities/origanization.entity';
import { OtpService } from 'src/otp/otp.service';
import { FileUploadService } from 'src/file-upload/file-upload.service';
import { ImageNameGenerator } from 'src/common/helper/image.helper';
import { User } from 'src/common/entities/user.entity';
import { BusinessException } from 'src/common/exceptions/business.exception';
import {
  getAptrack2BrandIdList,
  S3_COVER,
  S3_PROFILE,
  UNIVERSITY_BRAND_ID,
} from 'src/common/constants';
import { MasterService } from 'src/master/master.service';
import { CreateProfileDto } from 'src/users/dto/common/create-profile.dto';
import { ProfileResponseType } from 'src/common/types';
import { ModuleEnum } from 'src/common/enum/module.enum';
import { IStudentMetaData, UserMetaData } from 'src/common/entities/user-metadata.entity';
import { BrandUniversityCode } from 'src/common/enum/brand.enum';
import { studentHastDoSelectCourse } from 'src/common/helper/userMetaData.helper';
import { updateStudentDetailsToAptrack02 } from 'src/common/external-services/aptrack-one/endpoints';
import { handleAxiosError } from 'src/common/helper/error.helper';
import { CloudLoggerService } from 'src/cloud-logger/cloud-logger.service';
import { DefaultUserResponse } from 'src/common/strategy/jwt.strategy';
import { UsersService } from 'src/users/users.service';
@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(Profile)
    private profileRepository: Repository<Profile>,
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private otpService: OtpService,
    private fileUploadService: FileUploadService,
    private masterService: MasterService,
    @InjectRepository(UserMetaData)
    private userMetaDataRepository: Repository<UserMetaData>,
    private cloudLoggerService: CloudLoggerService,
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
  ) {}

  async createProfile(
    createProfileDto: CreateProfileDto,
    user: User,
    manager?: EntityManager,
  ): Promise<Profile> {
    const profile = this.profileRepository.create({
      ...createProfileDto,
      isSMSVerified: createProfileDto.isMobileVerified,
      userReference: user,
    });

    if (manager) {
      return await manager.save(profile);
    } else {
      return await this.profileRepository.save(profile);
    }
  }

  private async getGuestOrOrgProfile(user: User) {
    if (user.userRole[0].role == Role.Org) {
      return await this.organizationRepository.findOneBy({ id: user.id });
    } else {
      return await this.userRepository.findOneBy({ id: user.id });
    }
  }

  public async getStudentOrFacultyBaseProfile(id: number): Promise<any> {
    const user = new User({ id: id });
    let profile: any = await this.profileRepository.findOne({
      where: { userReference: user },
      relations: { userReference: true },
      select: {
        userReference: {
          id: true,
          userId: true,
          termsAccepted: true,
          isDomestic: true,
          universityCode: true,
          userType: true,
        },
      },
    });

    const coverImagePresignedUrl =
      await this.fileUploadService.generateGetObjectPresignedUrl(profile.coverImage);

    const profileImagePresignedUrl =
      await this.fileUploadService.generateGetObjectPresignedUrl(profile.profileImage);

    return {
      ...profile,
      coverImagePresignedUrl,
      profileImagePresignedUrl,
    };
  }

  public async getStudentOrFacultyProfile(user: DefaultUserResponse): Promise<any> {
    let profile: any = await this.profileRepository.findOne({
      where: { userReference: { id: user.id } },
      relations: { userReference: { userRole: { brand: true } } },
      select: {
        userReference: {
          id: true,
          userId: true,
          termsAccepted: true,
          isDomestic: true,
          userRole: {
            id: true,
            role: true,
            brandId: true,
            zone: true,
            region: true,
            area: true,
            centreName: true,
            centreId: true,
            centreIds: true,
            subBrandIds: true,
            hierarchy: true,
            brand: {
              id: true,
              key: true,
              name: true,
              icon: true,
            },
          },
          universityCode: true,
          userType: true,
        },
      },
    });

    const activeRole = user.activeRole;

    let module = [];
    let isPaymentEnabled = false;
    let hasDoSelectCourse = false;
    let isUniversityStudent = 0;

    if (DigitalRoles.includes(activeRole.role)) {
      module.push(ModuleEnum.Digital);
    }

    if ([1, 2, 3].includes(activeRole.brandId) && SocialRoles.includes(activeRole.role)) {
      module.push(ModuleEnum.Social);
    }

    if (profile.userReference.userRole.some((role) => role.role == Role.Student)) {
      if (profile.eligiblePlacement) {
        module.push(ModuleEnum.Placement);
      }

      if (profile.isDomestic === false) {
        isPaymentEnabled = false;
      } else if (
        profile.isDomestic === true &&
        profile.userReference.userRole.some((role) => [16].includes(role.brandId)) &&
        profile.universityCode === BrandUniversityCode.DMIS
      ) {
        isPaymentEnabled = false;
      } else {
        isPaymentEnabled = true;
      }

      const metaData = await this.userMetaDataRepository.findOne({
        where: { userId: user.id },
      });

      if (metaData?.metaData) {
        hasDoSelectCourse = studentHastDoSelectCourse(
          metaData.metaData as IStudentMetaData,
        );
      }

      if (UNIVERSITY_BRAND_ID.includes(profile.userReference.brandId)) {
        isUniversityStudent = 1;
      }
    }

    profile.module = module;
    profile.isPaymentEnabled = isPaymentEnabled;
    profile.hasDoSelectCourse = hasDoSelectCourse;
    profile.isUniversityStudent = isUniversityStudent;
    profile.subBrandIds = activeRole.subBrandIds;
    profile.centreIds = activeRole.centreIds;
    profile.hierarchy = activeRole.hierarchy;

    const coverImagePresignedUrl =
      await this.fileUploadService.generateGetObjectPresignedUrl(profile.coverImage);

    const profileImagePresignedUrl =
      await this.fileUploadService.generateGetObjectPresignedUrl(profile.profileImage);

    return {
      ...profile,
      coverImagePresignedUrl,
      profileImagePresignedUrl,
    };
  }

  async editProfile(
    user: DefaultUserResponse,
    updateProfile: EditProfileDto,
  ): Promise<void> {
    await this.profileRepository.update(
      { userReference: { id: user.id } },
      updateProfile,
    );
  }

  async editContact(user: DefaultUserResponse, editContact: EditContactDto) {
    if (user.activeRole.role == Role.Guest) {
      const filter = { [editContact.type]: editContact.data, role: Role.Guest };
      const result = await this.userRepository.findOneBy({ id: user.id });
      if (result) {
        throw new BusinessException(`( ${editContact.data} ) already exists`);
      }
    }

    let token = null;
    const message = `Enter 4-digit OTP sent to ${editContact.data}`;

    if (editContact.type == 'email') {
      [token] = await this.otpService.sendEmailOtp(editContact.data, {
        data: editContact.data,
      });
    } else {
      [token] = await this.otpService.sendMobileOtp(editContact.data, {
        data: editContact.data,
      });
    }

    return {
      message,
      token,
    };
  }

  async updateContact(user: DefaultUserResponse, editContact: UpdateContactDto) {
    type UpdateProfile = {
      email?: string;
      isEmailVerified?: number;
      mobile?: string;
      isSMSVerified?: number;
    };
    const updateProfile: UpdateProfile = {};
    // const updateUser: UpdateProfile = {};

    if (editContact.type === ContactType.EMAIL) {
      await this.otpService.verifyEmailOtp(
        editContact.otp,
        editContact.data,
        editContact.token,
      );
      // updateUser.email = editContact.data;
      updateProfile.email = editContact.data;
      updateProfile.isEmailVerified = 1;
    }

    if (editContact.type === ContactType.MOBILE) {
      await this.otpService.verifyMobileOtp(
        editContact.otp,
        editContact.data,
        editContact.token,
      );
      // updateUser.mobile = editContact.data;
      updateProfile.mobile = editContact.data;
      updateProfile.isSMSVerified = 1;
    }
    const brand = await this.masterService.getBrandById(user.activeRole.brandId);
    if (getAptrack2BrandIdList().includes(brand.key)) {
      if (editContact.type === ContactType.MOBILE) {
        updateStudentDetailsToAptrack02(user.userId, editContact.data).catch((error) => {
          handleAxiosError(`in updateContact => ${user.userId}`, error, (message, data) =>
            this.cloudLoggerService.error(message, data),
          );
        });
      } else {
        updateStudentDetailsToAptrack02(user.userId, null, editContact.data).catch(
          (error) => {
            handleAxiosError(
              `in updateContact => ${user.userId}`,
              error,
              (message, data) => this.cloudLoggerService.error(message, data),
            );
          },
        );
      }
    }
    await this.profileRepository.update(
      { userReference: { id: user.id } },
      updateProfile,
    );
    // await this.userRepository.update(user.id, updateUser);
  }

  async uploadProfileImg(
    user: DefaultUserResponse,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const profile = await this.profileRepository.findOneBy({
      userReference: { id: user.id },
    });
    const userProfileImage = profile.profileImage;

    const imgName = ImageNameGenerator(file.mimetype, S3_PROFILE);

    const profileDirPath = `${S3_PROFILE}/${user.id}`;

    await this.fileUploadService.uploadFileToS3(file.buffer, imgName, profileDirPath);

    const updateProfileImg = {
      profileImage: `${profileDirPath}/${imgName}`,
    };

    await this.profileRepository.update(
      { userReference: { id: user.id } },
      updateProfileImg,
    );

    if (userProfileImage) {
      // delete if needed
      // await this.fileUploadService.deleteFileFromS3(userProfileImage);
    }
  }

  async uploadCoverImg(
    user: DefaultUserResponse,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const profile = await this.profileRepository.findOneBy({
      userReference: { id: user.id },
    });
    const userCoverImage = profile.coverImage;

    const imgName = ImageNameGenerator(file.mimetype, S3_COVER);

    const coverDirPath = `${S3_COVER}/${user.id}`;

    await this.fileUploadService.uploadFileToS3(file.buffer, imgName, coverDirPath);

    const updateCoverImg = {
      coverImage: `${coverDirPath}/${imgName}`,
    };
    await this.profileRepository.update(
      { userReference: { id: user.id } },
      updateCoverImg,
    );

    if (userCoverImage) {
      // delete if needed
      // await this.fileUploadService.deleteFileFromS3(userCoverImage);
    }
  }
}
