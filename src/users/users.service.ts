import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/common/entities/user.entity';
import { Profile } from 'src/common/entities/profile.entity';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { Organization } from 'src/common/entities/origanization.entity';
import * as bcrypt from 'bcrypt';
import * as constant from '../common/constants';
import { EmailService } from 'src/email/email.service';
import { createUserEmailTemplate } from 'src/email/templates/create-user-email.template';
import { filterQueryBuilder } from 'src/common/helper/query.helper';
import { QueryParamsDto } from 'src/common/dto/query-params.dto';
import { FacultyUserFilterDto, FacultyUserQueryDto } from './dto/faculty-user.dto';
import { ProfileService } from 'src/profile/profile.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  AddNotification,
  AddNotificationEvent,
} from 'src/notification/events/notification.event';
import { NotificationTypeValueEnum } from 'src/common/entities/notificationType.entity';
import { DeliveryTypeValueEnum } from 'src/common/entities/deliveryType.entity';
import { SaveTokenDto } from './dto/token-user.dto';
import { BusinessException } from 'src/common/exceptions/business.exception';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { generatePassword } from 'src/common/helper/randomPasswordGenerator.helper';
import { CreateStudentDto } from './dto/create-student.dto';
import { plainToInstance } from 'class-transformer';
import { CreateAeFacultyDto, CreateFacultyDto } from './dto/create-faculty.dto';
import { WorkerPool } from 'src/common/workerPool';
import { USER_MESSAGES } from '../common/json/error-messages.json';
import {
  IAptrackEmployeeMetaData,
  UserMetaData,
  IStudentMetaData,
  IAptrackStudentPGMetaData,
  IAptrack2EmployeeMetaData,
} from 'src/common/entities/user-metadata.entity';
import { CreateAdminDto } from './dto/create-admin.dto';
import { CreateJudgeDto } from './dto/create-judge.dto';
import { FetchRoleBasedDetailsDto } from './dto/fetch-role-based-details.dto';
import {
  getAptrackEmployeeBookDetails,
  getAptrackEmployeeProfileDetails,
} from 'src/common/external-services/aptrack-one/endpoints';
import { CloudLoggerService } from 'src/cloud-logger/cloud-logger.service';
import { UserSession } from 'src/common/entities/userSession.entity';
import { CreateModeratorDto } from './dto/create-moderator.dto';
import { MasterService } from 'src/master/master.service';
import {
  AptrackEmployeeSubBrandKeyArray,
  studentSubBrandKeyArray,
} from 'src/common/helper/userMetaData.helper';
import { isAptrackEmployeeMetaData, isStudentMetaData } from 'src/common/types/guard';
import { Role } from 'src/common/enum/role.enum';
import {
  getStudentMetaDataRedisKeyFromAptrackByBrandId,
  getUserActiveRoleRedisKey,
} from 'src/cache/redis-keys';
import { RedisCacheService } from 'src/cache/redis-cache.service';
import { CreateDigitalAuditorDto } from './dto/create-digital-auditor.dto';
import { getFullName } from 'src/common/helper/string.helper';
import { UserRole } from 'src/common/entities/userRole.entity';
import { runInTransaction } from 'src/common/helper/transaction.helper';
import {
  AptrackProconnectIntegratedRoles,
  AptrackRole,
} from 'src/common/enum/aptrack-role.enum';
import {
  simplifyBrandIdsForCE,
  simplifyTopAccessForAE,
} from 'src/common/helper/role.helper';
import { DefaultUserResponse } from 'src/common/strategy/jwt.strategy';
import { transformFilterKeysWithTableContext } from 'src/common/helper/transformFilterKeysWithTableContext.helper';
import { UpdateAptrackUserDetailsDto } from './dto/update-aptrack-user-details.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly emailService: EmailService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserSession)
    private userSessionRepository: Repository<UserSession>,
    @InjectRepository(Profile)
    private profileRepository: Repository<Profile>,
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
    @InjectRepository(UserMetaData)
    private userMetaDataRepository: Repository<UserMetaData>,
    @InjectRepository(UserRole)
    private userRoleRepository: Repository<UserRole>,

    private profileService: ProfileService,
    private eventEmitter: EventEmitter2,
    @InjectDataSource() private dataSource: DataSource,
    private cloudLoggerService: CloudLoggerService,
    private readonly masterService: MasterService,
    private readonly redisCache: RedisCacheService,
    private readonly configService: ConfigService,
  ) {}

  private async getPassword(defaultPass = null) {
    const plainPassword = defaultPass || generatePassword();
    let hashedPassword = await bcrypt.hash(plainPassword, constant.SALT_ROUNDS);
    return { hashedPassword, plainPassword };
  }

  async findUserById(id: number): Promise<User> {
    return await this.userRepository.findOne({
      where: { id },
      relations: { userRole: { brand: true } },
    });
  }

  async findStudentByUserId(studentId: string): Promise<User> {
    return await this.userRepository.findOne({
      where: {
        userId: studentId,
      },
      relations: { userRole: { brand: true } },
    });
  }

  async findAll(filter: any = {}): Promise<User[]> {
    return await this.userRepository.find(filter);
  }

  async findAllFaculty(
    queryDto?: FacultyUserQueryDto,
    searchKeys?: string[],
  ): Promise<{ faculties: User[]; count: number }> {
    const filterMappings = {
      role: 'userRole.role',
      centreIds: 'userRole.centreIds',
      brandId: 'userRole.brandId',
    };
    queryDto.filter = transformFilterKeysWithTableContext(queryDto, filterMappings);

    const queryBuilderInstance = this.userRepository.createQueryBuilder('user');
    const columnTypes = { 'userRole.centreIds': 'array' };

    const queryBuilder = filterQueryBuilder({
      queryParams: queryDto,
      queryBuilder: queryBuilderInstance,
      searchKeys: searchKeys,
      filters: queryDto.filter,
      columnTypes,
    });

    queryBuilder.innerJoin('user.userRole', 'userRole');

    console.log(queryBuilder.getQueryAndParameters());

    const [users, count] = await queryBuilder.getManyAndCount();

    return {
      faculties: users,
      count: count,
    };
  }

  async createFaculty(
    createFacultyDto: CreateFacultyDto,
    manager: EntityManager,
    defaultPass = null,
  ) {
    let { hashedPassword, plainPassword } = await this.getPassword(defaultPass);

    let faculty = this.userRepository.create({
      ...createFacultyDto,
      name: getFullName(
        createFacultyDto.firstName,
        createFacultyDto.middleName,
        createFacultyDto.lastName,
      ),
      password: hashedPassword,
      organization: { id: 1 },
    });

    faculty = await manager.save(faculty);

    // create role
    const simplifyRoles = simplifyBrandIdsForCE(createFacultyDto.brandIds);
    const userRoles: any = [];

    for (const simplifyRole of simplifyRoles) {
      const proconnectBrand = await this.masterService.getBrandByKey(
        simplifyRole.brandId,
      );

      if (proconnectBrand) {
        // handle sub-brands
        let subBrandIds = [];
        if (await this.masterService.hasMultiBrands(proconnectBrand.id)) {
          const subBrandKey = AptrackEmployeeSubBrandKeyArray(createFacultyDto.SubBrands);
          const brands = await this.masterService.getBrandsByKey(subBrandKey);
          subBrandIds = brands.map((brand) => brand.id);
        }

        // add hierarchy
        userRoles.push({
          user: faculty,
          brandId: proconnectBrand.id,
          role: simplifyRole.role,
          centreIds: simplifyRole.centreIds,
          subBrandIds,
          hierarchy: simplifyRole.centreHierarchy,
        });
      }
    }

    // Create entities
    const roleEntities = this.userRoleRepository.create(userRoles);

    // Single DB call instead of many
    await manager.save(roleEntities);

    await this.profileService.createProfile(createFacultyDto, faculty, manager);

    return faculty;
  }

  async createAeFaculty(
    createFacultyDto: CreateAeFacultyDto,
    manager: EntityManager,
    defaultPass = null,
  ) {
    let { hashedPassword, plainPassword } = await this.getPassword(defaultPass);

    let faculty = this.userRepository.create({
      ...createFacultyDto,
      name: getFullName(
        createFacultyDto.firstName,
        createFacultyDto.middleName,
        createFacultyDto.lastName,
      ),
      password: hashedPassword,
      organization: { id: 1 },
    });

    faculty = await manager.save(faculty);

    // create role
    const simplifyRoles = simplifyTopAccessForAE(createFacultyDto.TopAccess);
    const userRoles = [];

    for (const simplifyRole of simplifyRoles) {
      const proconnectBrand = await this.masterService.getBrandByKey(
        simplifyRole.brandId,
      );

      if (proconnectBrand) {
        // handle sub-brands
        let subBrandIds = [];
        if (await this.masterService.hasMultiBrands(proconnectBrand.id)) {
          const brandList = new Set<number>([
            ...(proconnectBrand.subBrandIds || []),
            proconnectBrand.id,
          ]);

          subBrandIds = Array.from(brandList);
        } else {
          subBrandIds = [proconnectBrand.id];
        }

        userRoles.push({
          user: faculty,
          brandId: proconnectBrand.id,
          role: simplifyRole.role,
          hierarchy: simplifyRole.hierarchy,
          subBrandIds,
        });
      }
    }

    // Create entities
    const roleEntities = this.userRoleRepository.create(userRoles);

    // Single DB call instead of many
    await manager.save(roleEntities);

    await this.profileService.createProfile(createFacultyDto, faculty, manager);

    return faculty;
  }

  async createStudent(
    createStudentDto: CreateStudentDto,
    manager: EntityManager,
    defaultPass = null,
  ) {
    let { hashedPassword, plainPassword } = await this.getPassword(defaultPass);

    let student = this.userRepository.create({
      ...createStudentDto,
      name: getFullName(
        createStudentDto.firstName,
        createStudentDto.middleName,
        createStudentDto.lastName,
      ),
      password: hashedPassword,
      organization: { id: 1 },
    });

    student = await manager.save(student);

    let userRole = this.userRoleRepository.create({
      user: student,
      brandId: createStudentDto.brandId,
      role: Role.Student,
      centreId: createStudentDto.centerId,
      subBrandIds: createStudentDto.subBrandIds,
    });

    userRole = await manager.save(userRole);

    await this.profileService.createProfile(createStudentDto, student, manager);

    return student;
  }

  async createAdmin(
    createAdminDto: CreateAdminDto,
    manager: EntityManager,
    defaultPass = null,
  ) {
    let { hashedPassword, plainPassword } = await this.getPassword(defaultPass);

    let admin = this.userRepository.create({
      ...createAdminDto,
      name: createAdminDto.firstName,
      password: hashedPassword,
      organization: { id: 1 },
    });

    admin = await manager.save(admin);

    await this.profileService.createProfile(createAdminDto, admin, manager);

    return admin;
  }

  async createModerator(
    createAdminDto: CreateModeratorDto,
    manager: EntityManager,
    defaultPass = null,
  ) {
    let { hashedPassword, plainPassword } = await this.getPassword(defaultPass);

    let admin = this.userRepository.create({
      ...createAdminDto,
      name: createAdminDto.firstName,
      password: hashedPassword,
      organization: { id: 1 },
    });

    admin = await manager.save(admin);

    await this.profileService.createProfile(createAdminDto, admin, manager);

    return admin;
  }

  async createDigitalAuditor(
    createDigitalAuditorDto: CreateDigitalAuditorDto,
    manager: EntityManager,
    defaultPass = null,
  ) {
    let { hashedPassword, plainPassword } = await this.getPassword(defaultPass);

    let digitalAuditor = this.userRepository.create({
      ...createDigitalAuditorDto,
      name: createDigitalAuditorDto.firstName,
      password: hashedPassword,
      organization: { id: 1 },
    });

    digitalAuditor = await manager.save(digitalAuditor);

    await this.profileService.createProfile(
      createDigitalAuditorDto,
      digitalAuditor,
      manager,
    );

    return digitalAuditor;
  }

  async createJudge(createJudgeDto: CreateJudgeDto, defaultPass = null) {
    let { hashedPassword, plainPassword } = await this.getPassword(defaultPass);

    let judge = this.userRepository.create({
      ...createJudgeDto,
      password: hashedPassword,
      organization: { id: 1 },
    });

    return await this.userRepository.save(judge);
  }

  async saveToken(user: DefaultUserResponse, saveToken: SaveTokenDto): Promise<void> {
    const tokenData = {
      [saveToken.type]: saveToken.fcmToken,
    };
    await this.userRepository.update(user.id, tokenData);
  }

  async resetUserPassword(resetPasswordDto: ResetPasswordDto) {
    const randomPassword = Math.random().toString(36).slice(-8);
    let hashedPassword = await bcrypt.hash(randomPassword, constant.SALT_ROUNDS);
    hashedPassword = 'password';

    await this.userRepository
      .createQueryBuilder()
      .update({ password: hashedPassword })
      .where('userId in (:...userKey)', { userKey: resetPasswordDto.userKey })
      .execute();

    return hashedPassword;
  }

  async userDataByUserKey(userKey: string) {
    return await this.userRepository.findOne({
      where: { userId: userKey },
      relations: { profile: true },
    });
  }

  async updateTermsAndConditionFlag(user: DefaultUserResponse) {
    await this.userRepository.update({ id: user.id }, { termsAccepted: 1 });
  }

  async fetchAndUpdateCenterEmployeeMetaData(
    user: DefaultUserResponse,
    roleDto: FetchRoleBasedDetailsDto,
  ) {
    try {
      const brand = await this.masterService.getBrandById(roleDto.brandId);

      // pass brand Id and modify for aptrack 1 format
      const metaData = await getAptrackEmployeeBookDetails({
        username: user.userId,
        role: roleDto.role,
        brandId: brand.key, //aptrack brandKey
      });

      const updatePromises = [];

      if (metaData) {
        updatePromises.push(
          this.addUpdateUserMetaData(user.id, metaData),
          this.updateUserDetailsWithMetaData(user.id, metaData),
        );
      }

      await Promise.all(updatePromises);
    } catch (error) {
      this.logger.error(
        `fetchAndUpdateCenterEmployeeMetaData:failed to fetch employee meta-data for userId=${user.userId} :${error}`,
      );

      this.cloudLoggerService.error(
        `Failed: fetchAndUpdateCenterEmployeeMetaData: userId=${user.userId}`,
        error.toString(),
      );
    }
  }
  // ------------------------------------------------------------------

  /**
   * Updates passwords for a batch of users.
   * @param {User[]} users - List of users to update.
   * @returns {Promise<void>}
   */
  async updateBatchRandomPasswords(
    users: User[],
    excludes: Array<number>,
  ): Promise<void> {
    console.log('gen start');

    const updatedUsers = users.map((user) => {
      if (!excludes.includes(user.id)) {
        user.password = generatePassword();
      }
      return user;
    });

    console.log('gen end');

    console.log('save started');

    // Save the updated users in bulk
    await this.userRepository.save(updatedUsers);
    console.log('save done');
  }

  /**
   * Update passwords of all users.
   * @returns {Promise<void>}
   */
  // async updateAllUsersRandomPasswords(
  //   excludes: Array<number>,
  //   center?: string,
  // ): Promise<void> {
  //   const batchSize = 200;
  //   let offset = 0;

  //   while (true) {
  //     const users = await this.userRepository.find({
  //       where: center ? { centreName: center } : {},
  //       skip: offset,
  //       take: batchSize,
  //       order: { id: 'ASC' },
  //     });
  //     console.log('users [0]', users[0]?.id);

  //     if (users.length === 0) {
  //       break;
  //     }

  //     console.log(`Updating batch starting at offset ${offset}`);
  //     await this.updateBatchRandomPasswords(users, excludes);

  //     offset += batchSize;
  //   }

  //   console.log('All user passwords updated successfully.');
  // }

  hashWorkerScript = `
  const bcrypt = require('bcrypt');
  const { parentPort, workerData } = require('worker_threads');

  (async () => {
    try {
      const hashedPassword = await bcrypt.hash(workerData.password, workerData.saltRounds);
      parentPort.postMessage({ success: true, result: hashedPassword });
    } catch (error) {
      parentPort.postMessage({ success: false, error: error.message });
    }
  })();
`;

  async encryptBatchPasswords(users: User[], excludes: Array<number>): Promise<void> {
    const maxWorkers = 8; // Adjust based on system capacity (try 8-10 for better concurrency)
    const workerPool = new WorkerPool<{ password: string; saltRounds: number }, string>(
      this.hashWorkerScript,
      maxWorkers,
    );

    try {
      // Use Promise.all to allow parallel processing of hashing tasks
      const tasks = users.map((user) => {
        if (!excludes.includes(user.id)) {
          return workerPool
            .runTask({
              password: user.password,
              saltRounds: constant.SALT_ROUNDS,
            })
            .then((hashedPassword) => {
              user.password = hashedPassword;
              return user;
            });
        }
        return Promise.resolve(user);
      });

      const updatedUsers = await Promise.all(tasks); // This will process all users concurrently
      console.log(`Saving users: ${updatedUsers.length}`);

      // Save in chunks to minimize database writes (adjust batch size if necessary)
      const saveBatchSize = 200; // Experiment with smaller or larger batches depending on DB performance
      const savePromises = [];
      for (let i = 0; i < updatedUsers.length; i += saveBatchSize) {
        const batch = updatedUsers.slice(i, i + saveBatchSize);
        savePromises.push(this.userRepository.save(batch));
      }

      await Promise.all(savePromises); // Save batches concurrently
      console.log('Users saved successfully');
    } catch (error) {
      console.error('Error encrypting batch passwords:', error);
      throw new Error('Failed to encrypt passwords for the user batch.');
    }
  }

  async encryptAllPasswords(excludes: Array<number>, center?: string): Promise<void> {
    const batchSize = 200;
    let offset = 0;

    while (true) {
      const users = await this.userRepository.find({
        // where: center ? { centreName: center } : {},
        // where: { role: Role.Faculty },
        skip: offset,
        take: batchSize,
        order: { id: 'ASC' },
      });
      console.log('Fetched users:', users.length);
      // console.log('Fetched users:', users);

      // return;
      if (users.length === 0) break;

      console.log(`Encrypting batch starting at offset ${offset}`);
      await this.encryptBatchPasswords(users, excludes);
      offset += batchSize;
    }

    console.log('All user passwords are encrypted successfully.');
  }

  async fetchUserMetaData(userId: number) {
    const existing = await this.userMetaDataRepository.findOne({
      where: { userId: userId },
    });

    if (!existing) {
      console.log('Metadata not found for this user!');
    }

    return existing;
  }

  async addUpdateUserMetaData(
    userId: number,
    metaData: IStudentMetaData | IAptrack2EmployeeMetaData,
  ) {
    return await this.userMetaDataRepository.upsert({ userId, metaData }, ['userId']);
  }

  async addUpdateUsePGMetaData(userId: number, PGMetaData: IAptrackStudentPGMetaData[]) {
    const existing = await this.userMetaDataRepository.findOneBy({ userId });

    if (existing) {
      existing.pgMetaData = PGMetaData;
      return await this.userMetaDataRepository.save(existing);
    }

    let userPGMetaData = this.userMetaDataRepository.create({
      userId,
      pgMetaData: PGMetaData,
    });

    return await this.userMetaDataRepository.save(userPGMetaData);
  }

  async updateStudentDetailsWithMetaData(
    id: number, // PK
    metaData: IStudentMetaData,
  ) {
    await runInTransaction(this.dataSource, async (manager) => {
      const student = await this.userRepository.findOne({
        where: { id },
        relations: { profile: true, userRole: true },
      });

      const userTableDetails: Partial<User> = {
        ...(metaData?.isDomestic !== undefined && {
          isDomestic: metaData.isDomestic,
        }),
        ...(metaData?.UniversityCode && {
          universityCode: metaData.UniversityCode,
        }),
        ...(metaData?.firstName && {
          name: getFullName(metaData.firstName, metaData.middleName, metaData.lastName),
        }),
      };

      Object.assign(student, userTableDetails);
      await manager.save(User, student);

      // update profile table
      const profileDetails: Partial<Profile> = {
        ...(metaData?.firstName && { firstName: metaData.firstName }),
        ...(metaData?.middleName && { middleName: metaData.middleName }),
        ...(metaData?.lastName && { lastName: metaData.lastName }),
        ...(metaData?.dob && { dob: metaData.dob }),
        ...(metaData?.address && { address: metaData.address }),
        ...(metaData?.country && { country: metaData.country }),
        ...(metaData?.city && { city: metaData.city }),
        ...(metaData?.pinCode && { pinCode: metaData.pinCode }),
      };

      const currentProfile = await this.profileRepository.findOne({
        where: { userReference: { id } },
      });

      if (metaData?.isEmailVerified) {
        if (metaData?.email) profileDetails.email = metaData.email;
        if (metaData?.isEmailVerified)
          profileDetails.isEmailVerified = metaData.isEmailVerified;
      }

      if (metaData?.isMobileVerified) {
        if (metaData?.mobile) profileDetails.mobile = metaData.mobile;
        if (metaData?.isMobileVerified)
          profileDetails.isSMSVerified = metaData.isMobileVerified;
      }

      if (
        currentProfile.mobile == '0' ||
        currentProfile.mobile == '' ||
        currentProfile.mobile == '9999999999'
      ) {
        profileDetails.mobile = metaData.mobile;
      }

      Object.assign(student.profile, profileDetails);
      await manager.save(Profile, student.profile);

      // update role table
      let subBrandIds = [];
      if (await this.masterService.hasMultiBrands(student.userRole[0].brandId)) {
        const subBrandKey = studentSubBrandKeyArray(metaData);
        const brands = await this.masterService.getBrandsByKey(subBrandKey);
        subBrandIds = brands.map((brand) => brand.id);
      }

      const studentRoleDetails: Partial<UserRole> = {
        ...(metaData?.CenterDetails?.Zone && { zone: metaData.CenterDetails.Zone }),
        ...(metaData?.CenterDetails?.Region && { region: metaData.CenterDetails.Region }),
        ...(metaData?.CenterDetails?.Area && { area: metaData.CenterDetails.Area }),
        ...(metaData?.CenterDetails?.CentreName && {
          centreName: metaData.CenterDetails.CentreName,
        }),
        subBrandIds,
        ...(metaData?.CenterDetails?.CentreId && {
          centreId: metaData.CenterDetails.CentreId,
        }),
        ...(metaData?.CenterDetails?.CentreId && {
          centreIds: [metaData.CenterDetails.CentreId],
        }),
      };

      const studentRole = student.userRole[0];
      Object.assign(studentRole, studentRoleDetails);
      await manager.save(UserRole, studentRole);
    });
  }

  async updateEmployeeDetailsWithMetaData(
    id: number, // PK
    metaData: IAptrack2EmployeeMetaData,
  ) {
    await runInTransaction(this.dataSource, async (manager) => {
      const user = await this.userRepository.findOne({
        where: { id },
        relations: { profile: true, userRole: { brand: true } },
      });

      const userTableDetails: Partial<User> = {
        ...(metaData?.isDomestic !== undefined && {
          isDomestic: metaData.isDomestic,
        }),
        ...(metaData?.firstName && {
          name: getFullName(metaData.firstName, metaData.middleName, metaData.lastName),
        }),
      };

      Object.assign(user, userTableDetails);
      await manager.save(User, user);

      // update profile table
      const profileDetails: Partial<Profile> = {
        ...(metaData?.firstName && { firstName: metaData.firstName }),
        ...(metaData?.middleName && { middleName: metaData.middleName }),
        ...(metaData?.lastName && { lastName: metaData.lastName }),
        ...(metaData?.dob && { dob: metaData.dob }),
        ...(metaData?.address && { address: metaData.address }),
        ...(metaData?.country && { country: metaData.country }),
        ...(metaData?.city && { city: metaData.city }),
        ...(metaData?.pinCode && { pinCode: metaData.pinCode }),
        ...(metaData?.email && { email: metaData.email }),
        ...(metaData?.mobile && { mobile: metaData.mobile }),
      };

      Object.assign(user.profile, profileDetails);
      await manager.save(Profile, user.profile);

      // update role table
      if (metaData.userType == 'CE') {
        await this.updateCeRoles(user, metaData, manager);
      } else if (metaData.userType == 'AE') {
        await this.updateAeRoles(user, metaData, manager);
      }
    });
  }

  async updateAeRoles(
    user: User,
    metaData: IAptrack2EmployeeMetaData,
    manager: EntityManager,
  ) {
    const simplifyRoles = simplifyTopAccessForAE(metaData.TopAccess);
    const userUpdateRole: UserRole[] = [];

    for (const userRole of user.userRole) {
      // handle sub-brands
      let subBrandIds = [];
      if (await this.masterService.hasMultiBrands(userRole.brandId)) {
        const brandList = new Set<number>([
          ...(userRole.brand.subBrandIds || []),
          userRole.brandId,
        ]);

        subBrandIds = Array.from(brandList);
      } else {
        subBrandIds = [userRole.brandId];
      }

      const hierarchy =
        simplifyRoles.find(
          (role) => role.role == userRole.role && role.brandId == userRole.brand.key,
        )?.hierarchy || [];

      userUpdateRole.push({ ...userRole, hierarchy, subBrandIds });
    }

    return await manager.save(UserRole, userUpdateRole);
  }

  async updateCeRoles(
    user: User,
    metaData: IAptrack2EmployeeMetaData,
    manager: EntityManager,
  ) {
    const simplifyRoles = simplifyBrandIdsForCE(metaData.brandIds);
    const userUpdateRole: UserRole[] = [];

    for (const userRole of user.userRole) {
      // handle sub-brands
      let subBrandIds = [];
      if (await this.masterService.hasMultiBrands(userRole.brandId)) {
        const subBrandKey = AptrackEmployeeSubBrandKeyArray(metaData.SubBrands);
        const brands = await this.masterService.getBrandsByKey(subBrandKey);
        subBrandIds = brands.map((brand) => brand.id);
      }

      const centreIds =
        simplifyRoles.find(
          (role) => role.role == userRole.role && role.brandId == userRole.brand.key,
        )?.centreIds || [];

      const centreHierarchy =
        simplifyRoles.find(
          (role) => role.role == userRole.role && role.brandId == userRole.brand.key,
        )?.centreHierarchy || [];

      userUpdateRole.push({
        ...userRole,
        centreIds,
        subBrandIds,
        hierarchy: centreHierarchy,
      });
    }

    return await manager.save(UserRole, userUpdateRole);
  }

  async updateUserDetailsWithMetaData(
    id: number, // PK
    metaData: IStudentMetaData | IAptrack2EmployeeMetaData,
  ) {
    if (isStudentMetaData(metaData)) {
      await this.updateStudentDetailsWithMetaData(id, metaData);
    }

    if (isAptrackEmployeeMetaData(metaData)) {
      await this.updateEmployeeDetailsWithMetaData(id, metaData);
    }

    return;
  }

  async updateSelectedRole(
    user: DefaultUserResponse | User,
    roleDto: FetchRoleBasedDetailsDto,
  ) {
    const userRole = await this.userRoleRepository.findOne({
      where: { brandId: roleDto.brandId, role: roleDto.role, userId: user.id },
      relations: {
        brand: true,
      },
    });
    await this.userSessionRepository.update(
      { userId: user.id },
      {
        selectedRole: roleDto.role,
        brandId: userRole.brandId,
        userRole: userRole,
        brandKey: userRole?.brand ? userRole.brand.key : null,
      },
    );

    // Redis
    const redisTTL = this.configService.get('jwtConfig').JWT_ACCESS_TOKEN_EXPIRES_IN;
    const userActiveRoleKey = getUserActiveRoleRedisKey(user.id);
    await this.redisCache.set(userActiveRoleKey, userRole, redisTTL);
  }

  async fetchStudentMetaDataFromRedisOrDB(
    user: DefaultUserResponse,
  ): Promise<IStudentMetaData | null> {
    // check in redis student metaData
    const brand = await this.masterService.getBrandById(user.activeRole.brandId);
    const studentMetaDataRedisKey = getStudentMetaDataRedisKeyFromAptrackByBrandId(
      brand.key, // aptrack brandKey
      user.userId,
    );

    let studentRedisMetaData: unknown = await this.redisCache.get(
      studentMetaDataRedisKey,
    );

    const rawMetaData = Array.isArray(studentRedisMetaData)
      ? studentRedisMetaData[0] ?? null
      : studentRedisMetaData;

    // Try from redis first
    if (rawMetaData && isStudentMetaData(rawMetaData)) {
      return rawMetaData;
    }

    // Fallback to DB
    const data = await this.userMetaDataRepository.findOneBy({ userId: user.id });
    const metaData = data?.metaData ?? null;

    if (metaData && isStudentMetaData(metaData)) {
      return metaData;
    }
    return null;
  }

  async updateAptrackUserDetails(dto: UpdateAptrackUserDetailsDto) {
    let user = await this.userRepository.findOne({
      where: { userId: dto.userId },
      relations: {
        profile: true,
      },
    });

    const profileUpdate: Profile = {
      ...user.profile,
      ...(dto.email && { email: dto.email }),
      ...(dto.isEmailVerified !== undefined && { isEmailVerified: dto.isEmailVerified }),
      ...(dto.mobile && { mobile: dto.mobile }),
      ...(dto.isSMSVerified !== undefined && { isSMSVerified: dto.isSMSVerified }),
    };

    user = await this.userRepository.save({
      ...user,
      profile: profileUpdate,
    });

    return user;
  }

  async getSelectedRole(userId: number) {
    const activeSession = await this.userSessionRepository.findOne({
      where: { userId },
      relations: { userRole: { brand: true } },
    });

    return activeSession?.userRole ? activeSession.userRole : null;
  }
}
