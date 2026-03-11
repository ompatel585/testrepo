import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/common/entities/user.entity';
import { BusinessException } from 'src/common/exceptions/business.exception';
import { Repository } from 'typeorm';
import * as errorMessages from '../../common/json/error-messages.json';
import { AdminResetPasswordDto } from './dto/admin-reset-password.dto';
import { Profile } from 'src/common/entities/profile.entity';
import { ConfigService } from '@nestjs/config';
import { CryptoServiceUtil } from 'src/common/utils/crypto-service.util';
const { INVALID_CREDENTIALS } = errorMessages;
import * as bcrypt from 'bcrypt';
import * as constant from '../../common/constants';
import { UsersService } from 'src/users/users.service';
import { UpdateStudentMetaDataDto } from './dto/update-student-metaData.dto';
import {
  getStudentDetails,
  getStudentDetailsFromAptrack2,
} from 'src/common/external-services/aptrack-one/endpoints';
import { handleAxiosError } from 'src/common/helper/error.helper';
import { CloudLoggerService } from 'src/cloud-logger/cloud-logger.service';
import { RedisCacheService } from 'src/cache/redis-cache.service';
import { getStudentMetaDataRedisKeyFromAptrackByBrandId } from 'src/cache/redis-keys';
import { IStudentMetaData, UserMetaData } from 'src/common/entities/user-metadata.entity';
import { isStudentMetaData } from 'src/common/types/guard';
import {
  buildCourseWiseBooksAndCert,
  getStudentBcList,
} from 'src/common/helper/userMetaData.helper';
import { Role } from 'src/common/enum/role.enum';

@Injectable()
export class AdminAccessControlService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserMetaData)
    private readonly userMetaDataRepository: Repository<UserMetaData>,
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
    private readonly configService: ConfigService,
    private readonly cryptoService: CryptoServiceUtil,
    private readonly userService: UsersService,
    private cloudLoggerService: CloudLoggerService,
    private readonly redisCache: RedisCacheService,
  ) {}
  async resetPassword(resetPasswordDto: AdminResetPasswordDto) {
    let user = await this.userRepository.findOneBy({ userId: resetPasswordDto.userId });
    if (!user) {
      throw new NotFoundException('user not found!');
    }

    let profile: any = await this.profileRepository.findOneBy({
      userReference: { id: user.id },
    });

    let decryptPassword = resetPasswordDto.password;
    const isPassEncrypted = this.configService.get('serverConfig').ENCRYPT_PASSWORD;
    if (isPassEncrypted) {
      decryptPassword = this.cryptoService.decryptUsingCryptoJS(
        decryptPassword,
        process.env.PASSWORD_ENCRYPTION_KEY,
      );
    }

    if (decryptPassword) {
      let hashedPassword = await bcrypt.hash(decryptPassword, constant.SALT_ROUNDS);
      user.password = hashedPassword;

      profile.resetPasswordRequired = 0; // again password reset not required, since done by admin!
      await Promise.all([
        this.userRepository.save(user),
        this.profileRepository.save(profile),
      ]);
    } else {
      throw new BusinessException(INVALID_CREDENTIALS);
    }
  }

  async updateStudentMetaData(updateStudentMetaDataDto: UpdateStudentMetaDataDto) {
    const student = await this.userService.findStudentByUserId(
      updateStudentMetaDataDto.studentId,
    );
    if (!student) {
      throw new BusinessException('Student not found in pro-connect');
    }
    let metaData = null;
    const updatePromises = [];
    try {
      console.log('student.userRole[0].brand.key', student.userRole[0].brand.key);

      const result = await getStudentDetails(
        updateStudentMetaDataDto.studentId,
        'ALL',
        student.userRole[0].brand.key,
      );
      metaData = Array.isArray(result) ? result[0] : result;
    } catch (error) {
      console.log('student.userRole[0]. error', error);

      // handleAxiosError(
      //   `in login => ${updateStudentMetaDataDto.studentId}`,
      //   error,
      //   (message, data) => this.cloudLoggerService.error(message, data),
      // );
    }

    if (!metaData) {
      throw new NotFoundException(
        `Metadata not found for studentId: ${updateStudentMetaDataDto.studentId}`,
      );
    }

    const metaDataRedisKey = getStudentMetaDataRedisKeyFromAptrackByBrandId(
      student.userRole[0].brand.key,
      updateStudentMetaDataDto.studentId,
    );

    updatePromises.push(this.redisCache.set(metaDataRedisKey, metaData));
    updatePromises.push(this.userService.addUpdateUserMetaData(student.id, metaData));
    updatePromises.push(
      this.userService.updateUserDetailsWithMetaData(student.id, metaData),
    );

    await Promise.all(updatePromises);
  }

  async getStudentMetaData(studentId: string) {
    try {
      const proConnectStudent = await this.userRepository.findOne({
        where: { userId: studentId, userRole: { role: Role.Student } },
        relations: { profile: true, userRole: { brand: true } },
        select: {
          id: true,
          userId: true,
          userRole: true,
          profile: {
            firstName: true,
            middleName: true,
            lastName: true,
            email: true,
            mobile: true,
            profileImage: true,
          },
        },
      });

      let profileData: any = null;
      let courseWiseBooksAndCert: any[] = [];
      let bcList: any[] = [];
      let isRegistered = false;

      if (proConnectStudent) {
        isRegistered = true;

        const studentMetaData = await this.userMetaDataRepository.findOne({
          where: { userId: proConnectStudent.id },
        });

        if (studentMetaData && isStudentMetaData(studentMetaData.metaData)) {
          courseWiseBooksAndCert = buildCourseWiseBooksAndCert(
            studentMetaData.metaData,
            proConnectStudent.userRole[0].brand.key,
          );
          bcList = getStudentBcList(studentMetaData.metaData);
        }

        profileData = {
          ...proConnectStudent,
          firstName: proConnectStudent.profile.firstName,
          middleName: proConnectStudent.profile.middleName,
          lastName: proConnectStudent.profile.lastName,
          email: proConnectStudent.profile.email,
          mobile: proConnectStudent.profile.mobile,
          profileImage: proConnectStudent.profile.profileImage,
        };

        delete profileData?.profile;
      } else {
        // try to fetch from aptrack 1 and 2
        const results = await Promise.allSettled([
          getStudentDetails(studentId, 'ALL'),
          getStudentDetailsFromAptrack2(studentId, 'ALL'),
        ]);

        let aptrackStudent = null;
        let newStudentAptrack1 = null;
        let newStudentAptrack2 = null;

        if (results[0].status === 'fulfilled') {
          newStudentAptrack1 = results[0].value[0] as IStudentMetaData;
        }

        if (results[1].status === 'fulfilled') {
          newStudentAptrack2 = results[1].value[0] as IStudentMetaData;
        }

        if (
          newStudentAptrack2 &&
          constant
            .getAptrack2BrandIdList()
            .includes(parseInt(newStudentAptrack2?.brandId))
        ) {
          aptrackStudent = newStudentAptrack2;
        } else if (
          newStudentAptrack1 &&
          !constant
            .getAptrack2BrandIdList()
            .includes(parseInt(newStudentAptrack1?.brandId))
        ) {
          aptrackStudent = newStudentAptrack1;
        } else {
          aptrackStudent = null;
        }

        // if not found in aptrack
        if (!aptrackStudent) {
          throw new BusinessException('Student not found in aptrack');
        }

        courseWiseBooksAndCert = buildCourseWiseBooksAndCert(
          aptrackStudent,
          aptrackStudent.brandId,
        );
        bcList = getStudentBcList(aptrackStudent);

        profileData = {
          id: null,
          userId: aptrackStudent.userId,
          centreName: aptrackStudent.CenterDetails.CentreName,
          centreId: aptrackStudent.CenterDetails.CentreId,
          brand: {
            id: null,
            name: aptrackStudent.CenterDetails.BrandCode,
            code: aptrackStudent.CenterDetails.BrandCode,
            key: 55,
          },
          firstName: aptrackStudent.firstName,
          middleName: aptrackStudent.middleName,
          lastName: aptrackStudent.lastName,
          email: aptrackStudent.email,
          mobile: aptrackStudent.mobile,
          profileImage: null,
        };
      }

      return {
        isRegistered,
        bcList,
        profile: profileData,
        courseWiseBooksAndCert: courseWiseBooksAndCert,
      };
    } catch (error) {
      this.logger.error(`error fetching student-data: ${error}`);
      throw error;
    }
  }
}
