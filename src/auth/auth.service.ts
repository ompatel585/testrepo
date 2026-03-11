import { Injectable, Logger } from '@nestjs/common';
import { JsonWebTokenError, JwtService, TokenExpiredError } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/common/entities/user.entity';
import { Profile } from 'src/common/entities/profile.entity';
import { DataSource, Not, Repository } from 'typeorm';
import { Organization } from 'src/common/entities/origanization.entity';
import {
  ProconnectAllEmployeeTypeRolesArray,
  ProconnectAptrackEmployeeTypeRolesArray,
  ProconnectCenterEmployeeTypeRolesArray,
  Role,
  UserHasBrandArray,
} from 'src/common/enum/role.enum';
import { v4 as uuidv4 } from 'uuid';
import { GuestRegisterDto } from './dto/guest-register.dto';
import { GuestGenerateOtp } from './dto/guest-generate-otp.dto';
import { generateOtp } from 'src/common/helper/index.helper';
import * as bcrypt from 'bcrypt';
import * as constant from '../common/constants';
import {
  ForgotPasswordDto,
  ForgotPasswordDtoEnterType,
  ForgotPasswordDtoUserType,
} from './dto/forgot-password.dto';
import { ForgotPasswordVerifyDto } from './dto/forgot-password-verify.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { ConfigService } from '@nestjs/config';
import { forgotPasswordOtpEmailTemplate } from 'src/email/templates/otp-email.template';
import { EmailService } from 'src/email/email.service';
import { OtpService } from 'src/otp/otp.service';
import { SMSService } from 'src/sms/sms.service';
import { mobileNumberChangeOtpTemplate } from 'src/sms/templates/otp-sms.template';
import { BusinessException } from 'src/common/exceptions/business.exception';
import { GuestLoginDtoType } from './dto/guest-login.dto';
import { GuestSocialOAuthRegisterDto } from './dto/guest-social-oauth-register';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ServiceLoginDto } from './dto/service-login.dto';
import { ServiceAccess } from 'src/common/entities/service-access.entity';
import * as errorMessages from '../common/json/error-messages.json';
import { RECAPTCHA_VERIFY_URL } from 'src/common/constants';
import { CloudLoggerService } from 'src/cloud-logger/cloud-logger.service';

import axios, { AxiosError } from 'axios';
import { generatePassword } from 'src/common/helper/randomPasswordGenerator.helper';
import { CryptoServiceUtil } from 'src/common/utils/crypto-service.util';
import {
  checkFacultyExitsWithPass,
  checkFacultyExitsWithPassFromAptrack2,
  getAptrackEmployeeBookDetails,
  getAptrackEmployeeProfileDetails,
  getAptrackEmployeeProfileDetailsFromAptrack2,
  getStudentDetails,
  getStudentDetailsFromAptrack2,
} from 'src/common/external-services/aptrack-one/endpoints';
import { UsersService } from 'src/users/users.service';
import { MasterService } from 'src/master/master.service';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateStudentDto } from 'src/users/dto/create-student.dto';
import { CreateAeFacultyDto, CreateFacultyDto } from 'src/users/dto/create-faculty.dto';
import { runInTransaction } from 'src/common/helper/transaction.helper';
import {
  AptrackCentreEmployeeRoles,
  AptrackProconnectIntegratedRoles,
  AptrackRole,
  filterOutProconnectEquivalentRoles,
} from 'src/common/enum/aptrack-role.enum';
import { UserSession } from 'src/common/entities/userSession.entity';
import {
  AptrackEmployeeSubBrandKeyArray,
  formatAptrack1CEMetaDataIntoAptrack1,
  studentSubBrandKeyArray,
} from 'src/common/helper/userMetaData.helper';
import { handleAxiosError } from 'src/common/helper/error.helper';

import { RedisCacheService } from 'src/cache/redis-cache.service';

import {
  getFacultyProfileMetaDataAptrack2RedisKey,
  getFacultyProfileMetaDataRedisKey,
  getFacultyProfileMetaDataRedisKeyFromAptrackByBrandId,
  getStudentMetaDataAptrack2RedisKey,
  getStudentMetaDataRedisKey,
  getStudentMetaDataRedisKeyFromAptrackByBrandId,
  getUserActiveRoleRedisKey,
} from 'src/cache/redis-keys';
import {
  IAptrack2EmployeeMetaData,
  IStudentMetaData,
} from 'src/common/entities/user-metadata.entity';
import { AptrackUserService } from 'src/users/aptrack-user.service';
import {
  allRolesArray,
  brandRoleFormat,
  getAeRoles,
  getFacultyRoles,
} from 'src/common/helper/role.helper';
import {
  DefaultUserResponse,
  OrgUserResponse,
  ServiceUserResponse,
} from 'src/common/strategy/jwt.strategy';
import { UserRole } from 'src/common/entities/userRole.entity';
import { FetchRoleBasedDetailsDto } from 'src/users/dto/fetch-role-based-details.dto';
import {
  PermissionErrorMessagesEnum,
  PermissionException,
} from 'src/common/exceptions/permission.exception';

const { AUTH_MESSAGES, INVALID_CREDENTIALS } = errorMessages;
const { OAUTH_MESSAGES, PASSWORD_MESSAGES, CAPTCHA_ERROR_MESSAGES, NEW_USER } =
  AUTH_MESSAGES;
const { CAPTCHA_VERIFICATION_FAILED, INVALID_CAPTCHA } = CAPTCHA_ERROR_MESSAGES;

type accessToken = {
  access_token: string;
};

// default CaptchaResponse interface
interface CaptchaResponse {
  success: boolean;
  'error-codes'?: string[];
  score?: number;
  challenge_ts?: string;
  hostname?: string;
}

@Injectable()
export class AuthService {
  private readonly recaptchaSecretKey = process.env.RECAPTCHA_SECRET_KEY;
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private jwtService: JwtService,
    private readonly smsService: SMSService,
    private otpService: OtpService,
    private emailService: EmailService,
    private readonly configService: ConfigService,
    private eventEmitter: EventEmitter2,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Profile)
    private profileRepository: Repository<Profile>,
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
    @InjectRepository(ServiceAccess)
    private serviceAccessRepository: Repository<ServiceAccess>,
    private cloudLoggerService: CloudLoggerService,
    private readonly cryptoService: CryptoServiceUtil,
    private readonly userService: UsersService,
    private readonly masterService: MasterService,
    private readonly dataSource: DataSource,
    private readonly redisCache: RedisCacheService,
    private readonly aptrackUserService: AptrackUserService,

    @InjectRepository(UserSession)
    private userSessionRepository: Repository<UserSession>,
    @InjectRepository(UserRole)
    private userRoleRepository: Repository<UserRole>,
  ) {}

  async guestGenerateOtp(guestGenerateOtpDto: GuestGenerateOtp) {
    let mobileToken = null;
    let emailToken = null;
    let message = '';

    if (guestGenerateOtpDto.email) {
      [emailToken] = await this.otpService.sendEmailOtp(guestGenerateOtpDto.email);
      message += `Please enter 4 digit code sent to ${guestGenerateOtpDto.email}`;
    }
    if (guestGenerateOtpDto.mobile) {
      [mobileToken] = await this.otpService.sendMobileOtp(guestGenerateOtpDto.mobile);
      message += guestGenerateOtpDto.email
        ? ` & ${guestGenerateOtpDto.mobile}`
        : `Please enter 4 digit code sent to ${guestGenerateOtpDto.mobile}`;
    }

    return {
      message,
      emailToken,
      mobileToken,
    };
  }

  async guestRegister(guestRegisterDto: GuestRegisterDto) {
    // let isEmailVerified = 0;
    // if (guestRegisterDto.emailToken) {
    //   isEmailVerified = 1;
    //   await this.otpService.verifyEmailOtp(
    //     guestRegisterDto.emailOtp,
    //     guestRegisterDto.email,
    //     guestRegisterDto.emailToken,
    //   );
    // }
    // let isSMSVerified = 0;
    // if (guestRegisterDto.mobileToken) {
    //   isSMSVerified = 1;
    //   await this.otpService.verifyMobileOtp(
    //     guestRegisterDto.mobileOtp,
    //     guestRegisterDto.mobile,
    //     guestRegisterDto.mobileToken,
    //   );
    // }
    // let hashedPassword = await bcrypt.hash(
    //   guestRegisterDto.password,
    //   constant.SALT_ROUNDS,
    // );
    // const organization = this.organizationRepository.create({ id: 1 });
    // let user = this.userRepository.create({
    //   ...guestRegisterDto,
    //   organization,
    //   role: Role.Guest,
    //   password: hashedPassword,
    // });
    // user = await this.userRepository.save(user);
    // return user;
  }

  async guestRegisterViaSocialOAuth(guestData: GuestSocialOAuthRegisterDto) {
    // const existingGuest = await this.userRepository.findOneBy({
    //   email: guestData.email,
    //   role: Role.Guest,
    // });
    // if (existingGuest) {
    //   return existingGuest;
    // }
    // const randomPassword = generatePassword();
    // const organization = new Organization({ id: 1 });
    // let hashedPassword = await bcrypt.hash(randomPassword, constant.SALT_ROUNDS); // Hashing the password
    // let user = new User({
    //   ...guestData,
    //   password: hashedPassword,
    //   organization,
    //   role: Role.Guest,
    // });
    // user = await this.userRepository.save(user);
    // return user;
  }

  async fetchUserDetailsFromGoogle(googleAccessToken: string) {
    try {
      const response = await fetch('https://www.googleapis.com/userinfo/v2/me', {
        headers: { Authorization: `Bearer ${googleAccessToken}` },
      });

      const data = await response.json();
      if (data.error) {
        throw new BusinessException(OAUTH_MESSAGES.INVALID_GOOGLE_TOKEN);
      }
      if (!data.name || !data.email) {
        throw new BusinessException(OAUTH_MESSAGES.INVALID_GOOGLE_ACCOUNT);
      }
      const name: string = data.name;
      const email: string = data.email;
      return { name, email };
    } catch (error) {
      throw error;
    }
  }

  async fetchUserDetailsFromFacebook(facebookAccessToken: string) {
    try {
      const response = await fetch(
        `https://graph.facebook.com/me?access_token=${facebookAccessToken}&fields=id,name,picture.type(large)`,
      );
      // const response = await fetch(
      //   `https://graph.facebook.com/v19.0/me?fields=id%2Cname%2Cemail&access_token=${facebookAccessToken}`,
      // );

      const data = await response.json();
      if (data.error) {
        throw new BusinessException(OAUTH_MESSAGES.INVALID_FACEBOOK_TOKEN);
      }
      if (!data.name || !data.email) {
        throw new BusinessException(OAUTH_MESSAGES.INVALID_FACEBOOK_ACCOUNT);
      }
      const name: string = data.name;
      const email: string = data.email;
      return { name, email };
    } catch (error) {
      throw error;
    }
  }

  async validateOrg(email: string, pass: string): Promise<Organization | null> {
    const org = await this.organizationRepository.findOneBy({ email });
    if (!org) {
      throw new BusinessException(INVALID_CREDENTIALS);
    }
    const comparePassword = await bcrypt.compare(pass, org.password);

    if (comparePassword) {
      return org;
    }
    throw new BusinessException(INVALID_CREDENTIALS);
  }

  private async checkForNewStudent(userId: string, pass: string) {
    try {
      let newStudent = null;

      // student fetch
      const [aptrack1Student, aptrack2Student] = await Promise.all([
        this.aptrackUserService.getAptrack1StudentFromRedisOrApi(userId),
        this.aptrackUserService.getAptrack2StudentFromRedisOrApi(userId),
      ]);

      if (aptrack1Student) {
        newStudent = aptrack1Student;
      }

      if (aptrack2Student) {
        newStudent = aptrack2Student;
      }

      if (!newStudent) {
        return null;
      }

      if (!this.aptrackUserService.isValidBC(newStudent, pass)) {
        return null;
      }

      await this.aptrackUserService.updateRedisWithStudentMetaData(newStudent);

      // student create
      const brand = await this.masterService.getBrandByKey(newStudent.brandId);
      newStudent.brandId = brand.id;
      if (!!brand.subBrandIds.length) {
        const brands = await this.masterService.getBrandsByKey(
          studentSubBrandKeyArray(newStudent),
        );
        newStudent.subBrandIds = brands.map((brand) => brand.id);
      }
      const createStudentDto = plainToInstance(CreateStudentDto, newStudent);
      const errors = await validate(createStudentDto);

      if (errors.length > 0) {
        this.logger.error(
          `checkForNewStudent validation failed => ${newStudent}`,
          errors,
        );
        this.cloudLoggerService.error(
          `checkForNewStudent validation failed => ${userId}`,
          errors.toString() + JSON.stringify(newStudent),
        );
        return null;
      }

      newStudent = await runInTransaction(this.dataSource, async (manager) => {
        return await this.userService.createStudent(createStudentDto, manager, pass);
      });

      let user = await this.userRepository.findOne({
        where: { id: newStudent.id },
        relations: { userRole: { brand: true } },
      });

      return user;
    } catch (error) {
      handleAxiosError(`in checkForNewStudent => ${userId}`, error, (message, data) =>
        this.cloudLoggerService.error(message, data),
      );
      return null;
    }
  }

  private async createNewCE(newFaculty: IAptrack2EmployeeMetaData, pass: string) {
    const userId = newFaculty.userId;

    // check has valid aptrack role
    const roles = getFacultyRoles(newFaculty);

    // set aptrack equivalent proconnect roles
    const activeRoles = filterOutProconnectEquivalentRoles(roles);

    // no active roles
    if (activeRoles.length == 0) {
      this.logger.error(`Faculty ${newFaculty} don't have any active role`);
      return null;
    }

    // validate newFaculty with CreateFacultyDto
    const createFacultyDto = plainToInstance(CreateFacultyDto, newFaculty);
    const errors = await validate(createFacultyDto);

    if (errors.length > 0) {
      this.logger.error(`checkForNewFaculty validation failed => ${newFaculty}`, errors);
      this.cloudLoggerService.error(
        `checkForNewFaculty validation failed => ${newFaculty}`,
        errors.toString() + JSON.stringify(newFaculty),
      );
      return null;
    }

    let user = await runInTransaction(this.dataSource, async (manager) => {
      return await this.userService.createFaculty(createFacultyDto, manager, pass);
    });

    user = await this.userRepository.findOne({
      where: { id: user.id },
      relations: { userRole: { brand: true } },
    });

    // set active role

    if (user.userRole.length == 1) {
      const activeRole = user.userRole[0];
      // fetch books
      const employeeProfileMetaData = await getAptrackEmployeeBookDetails({
        username: userId,
        role: activeRole.role,
        brandId: user.userRole[0].brand.key,
      });

      await this.userService.addUpdateUserMetaData(user.id, employeeProfileMetaData);
    }

    return user;
  }

  private async createNewAE(newFaculty: IAptrack2EmployeeMetaData) {
    // check has valid aptrack role
    const roles = getAeRoles(newFaculty);

    // set aptrack equivalent proconnect roles
    const activeRoles = filterOutProconnectEquivalentRoles(roles);

    // no active roles
    if (activeRoles.length == 0) {
      this.logger.error(
        `Faculty ${JSON.stringify(newFaculty)} don't have any active role`,
      );
      throw new PermissionException(errorMessages.AUTH_MESSAGES.NEW_USER.NO_ROLE);
    }

    // validate newFaculty with CreateFacultyDto
    const createFacultyDto = plainToInstance(CreateAeFacultyDto, newFaculty);
    const errors = await validate(createFacultyDto);

    if (errors.length > 0) {
      this.logger.error(`createNewAE validation failed => ${newFaculty}`, errors);
      this.cloudLoggerService.error(
        `createNewAE validation failed => ${newFaculty}`,
        errors.toString() + JSON.stringify(newFaculty),
      );
      return null;
    }

    let user = await runInTransaction(this.dataSource, async (manager) => {
      return await this.userService.createAeFaculty(
        createFacultyDto,
        manager,
        newFaculty.email,
      );
    });

    user = await this.userRepository.findOne({
      where: { id: user.id },
      relations: { userRole: { brand: true } },
    });

    return user;
  }

  private async checkForNewFaculty(
    userId: string,
    pass: string,
    hasPass: boolean = true,
  ) {
    try {
      let newFaculty = null;
      const [aptrack1Faculty, aptrack2Faculty] = await Promise.all([
        this.aptrackUserService.getAptrack1FacultyFromApi(userId, pass, hasPass),
        this.aptrackUserService.getAptrack2FacultyFromApi(userId, pass, hasPass),
      ]);

      if (aptrack1Faculty) {
        newFaculty = aptrack1Faculty;
      }

      if (aptrack2Faculty) {
        newFaculty = aptrack2Faculty;
      }

      if (!newFaculty) {
        return null;
      }

      await this.aptrackUserService.updateRedisWithAptrackEmployeeMetaData(newFaculty);

      if (newFaculty.userType === 'AE') {
        return await this.createNewAE(newFaculty);
      }

      return await this.createNewCE(newFaculty, pass);
    } catch (error) {
      handleAxiosError(`in checkForNewFaculty => ${userId}`, error, (message, data) =>
        this.cloudLoggerService.error(message, data),
      );
      return null;
    }
  }

  async validateUser(
    userId: string,
    pass: string,
    hasPass: boolean = true,
  ): Promise<User | null> {
    let user = await this.userRepository
      .createQueryBuilder('user')
      .where('LOWER(user.userId)=:userId', { userId: userId.toLowerCase() })
      .leftJoinAndSelect('user.userRole', 'userRole')
      .leftJoinAndSelect('userRole.brand', 'brand')
      .getOne();

    let decryptPass = pass;
    if (hasPass && this.configService.get('serverConfig').ENCRYPT_PASSWORD) {
      decryptPass = this.cryptoService.decryptUsingCryptoJS(
        pass,
        process.env.PASSWORD_ENCRYPTION_KEY,
      );
    }

    if (!user) {
      const newUserPromises = [];
      newUserPromises.push(this.checkForNewStudent(userId, decryptPass));
      newUserPromises.push(this.checkForNewFaculty(userId, decryptPass, hasPass));

      const [newStudent, newFaculty] = await Promise.all(newUserPromises);

      if (newStudent) return newStudent;

      if (newFaculty) return newFaculty;

      if (!hasPass) {
        throw new BusinessException(
          'You do not currently have an account in Aptrack. Please contact Aptrack team for further assistance.',
        );
      }

      throw new BusinessException(INVALID_CREDENTIALS);
    }

    if (hasPass) {
      const comparePassword = await bcrypt.compare(decryptPass, user.password);

      if (!comparePassword) {
        throw new BusinessException(INVALID_CREDENTIALS);
      }
    }

    const rolesArray = allRolesArray(user.userRole);
    // CE or AE
    if (
      ProconnectAllEmployeeTypeRolesArray.some((aptrackRole) =>
        rolesArray.includes(aptrackRole),
      )
    ) {
      try {
        // updating Center&Aptrack employee with latest roles
        // fetch all new roles
        let employeeProfileMetaData: IAptrack2EmployeeMetaData = null;

        // fetch book details for CE with single-role
        if (
          rolesArray.length == 1 &&
          ProconnectCenterEmployeeTypeRolesArray.includes(rolesArray[0])
        ) {
          // fetch books
          employeeProfileMetaData = await getAptrackEmployeeBookDetails({
            username: userId,
            role: rolesArray[0],
            brandId: user.userRole[0].brand.key,
          });
        } else {
          const CEAndAEProfileMetaDataRedisKey =
            getFacultyProfileMetaDataRedisKeyFromAptrackByBrandId(
              user.userRole[0].brand.key,
              userId,
            );

          // if aptrack 2 and modify response to aptrack 1
          let CEAndAEProfileMetaData = await this.redisCache.get(
            CEAndAEProfileMetaDataRedisKey,
          );

          // let CEAndAEProfileMetaData = null;

          if (!CEAndAEProfileMetaData) {
            // fetch profile-details for CE with multi-role & AE
            // add brandId for aptrack 1 or 2
            // aptrack1 or aptrack2 based on brandId
            employeeProfileMetaData = await getAptrackEmployeeProfileDetails({
              username: userId,
              brandId: user.userRole[0].brand.key,
            });

            await this.redisCache.set(
              CEAndAEProfileMetaDataRedisKey,
              employeeProfileMetaData,
            );
          } else {
            employeeProfileMetaData = CEAndAEProfileMetaData;
          }
        }

        if (employeeProfileMetaData.userType == 'CE') {
          user = await this.aptrackUserService.handleNewRolesForCE(
            user,
            employeeProfileMetaData,
          );
        } else if (employeeProfileMetaData.userType == 'AE') {
          user = await this.aptrackUserService.handleNewRolesForAE(
            user,
            employeeProfileMetaData,
          );
        }
      } catch (error) {
        handleAxiosError(`in validateUser => ${userId}`, error, (message, data) =>
          this.cloudLoggerService.error(message, data),
        );
      }
    }
    return user;
  }

  async validateGuest(
    type: string,
    pass: string,
    email: string | undefined,
    mobile: string | undefined,
  ) /* : Promise<User | null> */ {
    /* let user;
    if (type == GuestLoginDtoType.Email) {
      user = await this.userRepository.findOneBy({
        email,
        role: Role.Guest,
      });
    }
    if (type == GuestLoginDtoType.Mobile) {
      user = await this.userRepository.findOneBy({
        mobile,
        role: Role.Guest,
      });
    }

    if (!user) {
      throw new BusinessException(INVALID_CREDENTIALS);
    }
    let decryptPass = pass;
    if (this.configService.get('serverConfig').ENCRYPT_PASSWORD) {
      decryptPass = this.cryptoService.decryptUsingCryptoJS(
        pass,
        process.env.PASSWORD_ENCRYPTION_KEY,
      );
    }
    if (decryptPass) {
      const comparePassword = await bcrypt.compare(decryptPass, user.password);

      if (comparePassword) {
        return user;
      }
    }
    throw new BusinessException(INVALID_CREDENTIALS); */
    return null;
  }

  async orgLogin(user: any): Promise<accessToken> {
    const payload: OrgUserResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: Role.Org,
      userType: 'org',
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async login(user: User) {
    try {
      const updatePromises = [];
      // only fetches data on login for single role
      // for multi roles it will be fetched on role-select
      if (user.userRole.length === 1) {
        let metaData = null;
        const userRole = user.userRole[0].role;

        if (userRole == Role.Student) {
          const studentRole = user.userRole[0];
          if (user.fetchMetadata) {
            // basis brand AL or other call 1 or 2 redis
            const metaDataRedisKey = getStudentMetaDataRedisKeyFromAptrackByBrandId(
              studentRole.brand.key, // aptrackBrandId
              user.userId,
            );
            let redisMetaData = await this.redisCache.get(metaDataRedisKey);
            // let redisMetaData = null;
            redisMetaData = Array.isArray(redisMetaData)
              ? (redisMetaData[0] ?? null)
              : redisMetaData;
            if (redisMetaData) {
              metaData = redisMetaData;
            } else {
              const result = await getStudentDetails(
                user.userId,
                'ALL',
                studentRole.brand.key,
              );
              metaData = Array.isArray(result) ? result[0] : result;
            }

            // push into redis student metaData
            if (!redisMetaData) {
              await this.redisCache.set(metaDataRedisKey, metaData);
            }
          }
          // override with existing meta-data for fetchMetadata=false students
          if (!user.fetchMetadata) {
            const existingMetaData = await this.userService.fetchUserMetaData(user.id);
            if (existingMetaData) {
              metaData = existingMetaData.metaData;
            }
          }

          if (metaData) {
            updatePromises.push(
              this.userService.addUpdateUserMetaData(user.id, metaData),
            );
            updatePromises.push(
              this.userService.updateUserDetailsWithMetaData(user.id, metaData),
            );
          }
        }
      }
      await Promise.all(updatePromises);
    } catch (error) {
      handleAxiosError(`in login => ${user.userId}`, error, (message, data) =>
        this.cloudLoggerService.error(message, data),
      );
    }

    // JTI (JWT-ID) per login session!
    const jwtId = uuidv4();

    const roles = brandRoleFormat(user.userRole);

    const payload: DefaultUserResponse = {
      id: user.id,
      userId: user.userId,
      fetchMetadata: user.fetchMetadata,
      jti: jwtId,
      userType: user.userType,
      activeRole: null,
    };

    const accessToken = this.jwtService.sign(payload);

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('jwtConfig').JWT_STRATEGY_REFRESH_TOKEN_SECRET,
      expiresIn: this.configService.get('jwtConfig').JWT_REFRESH_TOKEN_EXPIRES_IN,
    });

    // set active role
    const activeRole = user.userRole[0];
    const userRole = await this.userRoleRepository.findOne({
      where: { brandId: activeRole.brandId, role: activeRole.role, userId: user.id },
      relations: {
        brand: true,
      },
    });

    await this.userSessionRepository.upsert(
      {
        userId: user.id,
        sessionId: jwtId,
        brandId: userRole.brandId,
        selectedRole: userRole.role,
        userRole,
        brandKey: userRole?.brand ? userRole.brand.key : null,
      },
      { conflictPaths: ['userId'] },
    );

    // Redis
    const redisTTL = this.configService.get('jwtConfig').JWT_ACCESS_TOKEN_EXPIRES_IN;

    const userActiveRoleKey = getUserActiveRoleRedisKey(user.id);

    await this.redisCache.set(userActiveRoleKey, userRole, redisTTL);

    return {
      refreshToken: refreshToken,
      access_token: accessToken,
      roles,
      userType: user.userType,
    };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    let condition = {};
    let sendOn = 'Email';
    let message = '';
    if (forgotPasswordDto.userType === ForgotPasswordDtoUserType.Guest) {
      if (forgotPasswordDto.type == ForgotPasswordDtoEnterType.Email) {
        condition = {
          where: { email: forgotPasswordDto.email, userRole: { role: Role.Guest } },
        };
      } else {
        condition = {
          where: { mobile: forgotPasswordDto.mobile, userRole: { role: Role.Guest } },
        };
        sendOn = 'Mobile';
      }
    } else {
      condition = {
        where: { userId: forgotPasswordDto.userId },
        relations: { profile: true, userRole: true },
      };
    }
    const user = await this.userRepository.findOne(condition);
    if (!user) {
      throw new BusinessException(INVALID_CREDENTIALS);
    }

    const otp = generateOtp();

    if (sendOn === 'Email') {
      let to = user.email;
      if (forgotPasswordDto.userType !== ForgotPasswordDtoUserType.Guest) {
        to = user.profile.email;

        if (!to) {
          throw new BusinessException('Email is not found for the user');
        }
      }
      const msg = {
        to: to,
        from: constant.FROM_EMAIL_ID,
        subject: 'OTP Confirmation!',
        html: forgotPasswordOtpEmailTemplate(otp),
      };
      await this.emailService.sendEmail(msg);

      message = `Please enter 4 digit code sent to ${to}`;
    } else {
      await this.smsService.sendSMS(mobileNumberChangeOtpTemplate(otp), user.mobile);
      message = `Please enter 4 digit code sent to ${user.mobile}`;
    }

    const payload = {
      id: user.id,
      otp,
      email: user.email,
      role: user.userRole[0].role,
    };

    const otpToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get('jwtConfig').OTP_SECRET,
      expiresIn: constant.OTP_EXPIRES_IN,
    });

    return {
      message: message,
      otpToken,
    };
  }

  async forgotPasswordOtpVerify(forgotPasswordVerifyDto: ForgotPasswordVerifyDto) {
    try {
      const decodedOtpToken = await this.jwtService.verifyAsync(
        forgotPasswordVerifyDto.otpToken,
        {
          secret: this.configService.get('jwtConfig').OTP_SECRET,
        },
      );

      if (!decodedOtpToken.otp) {
        throw new BusinessException(AUTH_MESSAGES.INVALID_OTP_TOKEN);
      }

      if (decodedOtpToken.otp != forgotPasswordVerifyDto.otp) {
        throw new BusinessException(AUTH_MESSAGES.INVALID_OTP);
      }

      const payload = {
        id: decodedOtpToken.id,
      };
      const passwordToken = this.jwtService.sign(payload, {
        secret: this.configService.get('jwtConfig').FORGOT_PASSWORD_SECRET,
        expiresIn: constant.OTP_EXPIRES_IN,
      });

      return {
        message: 'Otp verify successfully',
        passwordToken,
      };
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new BusinessException(AUTH_MESSAGES.EXPIRED_OTP);
      } else if (error instanceof JsonWebTokenError) {
        throw new BusinessException(AUTH_MESSAGES.INVALID_OTP_TOKEN);
      } else {
        throw error;
      }
    }
  }

  async updatePassword(updatePasswordDto: UpdatePasswordDto) {
    try {
      const decodedOtpToken = await this.jwtService.verifyAsync(
        updatePasswordDto.passwordToken,
        {
          secret: this.configService.get('jwtConfig').FORGOT_PASSWORD_SECRET,
        },
      );

      if (!decodedOtpToken.id) {
        throw new BusinessException(PASSWORD_MESSAGES.INVALID_PASSWORD_TOKEN);
      }

      let user = await this.userRepository.findOneBy({ id: decodedOtpToken.id });

      let decryptNewPassword = updatePasswordDto.newPassword;
      if (this.configService.get('serverConfig').ENCRYPT_PASSWORD) {
        decryptNewPassword = this.cryptoService.decryptUsingCryptoJS(
          updatePasswordDto.newPassword,
          process.env.PASSWORD_ENCRYPTION_KEY,
        );
      }
      if (decryptNewPassword) {
        const isMatch = await bcrypt.compare(decryptNewPassword, user.password);

        if (isMatch) {
          throw new BusinessException(PASSWORD_MESSAGES.OLD_NEW_PASSWORD_CANNOT_BE_SAME);
        }

        let hashedPassword = await bcrypt.hash(decryptNewPassword, constant.SALT_ROUNDS);
        user.password = hashedPassword;

        user = await this.userRepository.save(user);

        return {
          message: 'Password updated successfully',
        };
      }
      throw new BusinessException(INVALID_CREDENTIALS);
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new BusinessException(PASSWORD_MESSAGES.EXPIRED_PASSWORD_TOKEN);
      } else if (error instanceof JsonWebTokenError) {
        throw new BusinessException(PASSWORD_MESSAGES.INVALID_PASSWORD_TOKEN);
      } else {
        throw error;
      }
    }
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    let user = await this.userRepository.findOneBy({ userId: resetPasswordDto.userId });
    if (!user) {
      throw new BusinessException(INVALID_CREDENTIALS);
    }
    let profileUser = new User({ userId: resetPasswordDto.userId });
    let profile: any = await this.profileRepository.findOneBy({
      userReference: profileUser,
    });

    let decryptPassword = resetPasswordDto.password;
    const encryptPass = this.configService.get('serverConfig').ENCRYPT_PASSWORD;
    if (encryptPass) {
      decryptPassword = this.cryptoService.decryptUsingCryptoJS(
        decryptPassword,
        process.env.PASSWORD_ENCRYPTION_KEY,
      );
    }
    if (decryptPassword) {
      const comparePassword = await bcrypt.compare(decryptPassword, user.password);

      if (!comparePassword) {
        throw new BusinessException(INVALID_CREDENTIALS);
      }

      let decryptNewPassword = resetPasswordDto.newPassword;
      if (encryptPass) {
        decryptNewPassword = this.cryptoService.decryptUsingCryptoJS(
          decryptNewPassword,
          process.env.PASSWORD_ENCRYPTION_KEY,
        );
      }
      if (decryptNewPassword) {
        const isMatch = await bcrypt.compare(decryptNewPassword, user.password);

        if (isMatch) {
          throw new BusinessException(PASSWORD_MESSAGES.OLD_NEW_PASSWORD_CANNOT_BE_SAME);
        }

        let hashedPassword = await bcrypt.hash(decryptNewPassword, constant.SALT_ROUNDS);
        user.password = hashedPassword;

        profile.resetPasswordRequired = 0;

        await Promise.all([
          this.userRepository.save(user),
          this.profileRepository.save(profile),
        ]);
      } else {
        throw new BusinessException(INVALID_CREDENTIALS);
      }
    } else {
      throw new BusinessException(INVALID_CREDENTIALS);
    }
  }

  async serviceLogin(serviceLogin: ServiceLoginDto) {
    const service = await this.serviceAccessRepository.findOneBy({
      name: serviceLogin.name,
    });
    if (!service) {
      throw new BusinessException(INVALID_CREDENTIALS);
    }
    const comparePassword = serviceLogin.password === service.password;
    if (!comparePassword) {
      throw new BusinessException(INVALID_CREDENTIALS);
    }

    const payload: ServiceUserResponse = {
      id: service.id,
      name: service.name,
      role: Role.Service,
      userType: 'service',
    };

    const access_token = await this.jwtService.signAsync(payload, {
      secret: this.configService.get('jwtConfig').JWT_STRATEGY_SECRET,
      noTimestamp: true,
      expiresIn: '100y',
    });
    service.token = access_token;
    await this.serviceAccessRepository.save(service);
    return {
      access_token,
    };
  }

  async verifyCaptcha(captcha: string) {
    try {
      const response = await axios.post(RECAPTCHA_VERIFY_URL, null, {
        params: {
          secret: this.recaptchaSecretKey,
          response: captcha,
        },
      });

      const { success, 'error-codes': errorCodes } = response.data;
      if (!success) {
        // standard invalidCaptchaCodes
        const invalidCaptchaCodes = [
          CAPTCHA_ERROR_MESSAGES.MISSING_INPUT_RESPONSE, // User didn't complete the CAPTCHA
          CAPTCHA_ERROR_MESSAGES.INVALID_INPUT_RESPONSE, // CAPTCHA response is invalid
        ];

        if (errorCodes.some((code: string) => invalidCaptchaCodes.includes(code))) {
          this.logger.error(INVALID_CAPTCHA, errorCodes);
          throw new BusinessException(INVALID_CAPTCHA);
        } else {
          this.logger.error(CAPTCHA_VERIFICATION_FAILED, errorCodes);
          this.cloudLoggerService.error(CAPTCHA_VERIFICATION_FAILED, errorCodes);
          throw new BusinessException(CAPTCHA_VERIFICATION_FAILED);
        }
      }
      return { success };
    } catch (error) {
      if (error instanceof BusinessException) {
        throw error;
      } else {
        this.logger.error(CAPTCHA_VERIFICATION_FAILED, error.stack);
        this.cloudLoggerService.error(CAPTCHA_VERIFICATION_FAILED, error.stack);
        throw new BusinessException(CAPTCHA_VERIFICATION_FAILED);
      }
    }
  }

  async updateUserMetaDataOnRefreshToken(user: DefaultUserResponse) {
    try {
      const userData = await this.userRepository.findOne({
        where: { id: user.id },
        relations: {
          userRole: { brand: true },
        },
      });
      const roles = brandRoleFormat(userData.userRole);

      const hasValidRole = roles.some((role) =>
        [
          Role.Student,
          ...ProconnectCenterEmployeeTypeRolesArray,
          ...ProconnectAptrackEmployeeTypeRolesArray,
        ].includes(role.role),
      );

      if (!hasValidRole) {
        return;
      }

      const updatePromises = [];

      let metaData = null;
      // basis brandId 1 or 2
      if (roles.length == 1 && roles[0].role == Role.Student && user.fetchMetadata) {
        const brand = await this.masterService.getBrandById(roles[0].brandId);
        const metaDataRedisKey = getStudentMetaDataRedisKeyFromAptrackByBrandId(
          brand.key, // aptrack brandKey
          user.userId,
        );

        // let redisMetaData = await this.redisCache.get(metaDataRedisKey);
        let redisMetaData = null;
        redisMetaData = Array.isArray(redisMetaData)
          ? (redisMetaData[0] ?? null)
          : redisMetaData;

        if (redisMetaData) {
          metaData = redisMetaData;
        }

        if (!metaData) {
          const studentMetaData = await getStudentDetails(
            user.userId,
            'ALL',
            brand.key, // aptrack brandKey
          );

          metaData = Array.isArray(studentMetaData)
            ? studentMetaData[0]
            : studentMetaData;
          await this.redisCache.set(metaDataRedisKey, metaData);
        }

        if (metaData) {
          updatePromises.push(this.userService.addUpdateUserMetaData(user.id, metaData));
          updatePromises.push(
            this.userService.updateUserDetailsWithMetaData(user.id, metaData),
          );
        }
        await Promise.all(updatePromises);
      } else {
        // for employee with single-role
        if (roles.length == 1) {
          const userRole = roles[0].role;
          const brand = await this.masterService.getBrandById(roles[0].brandId);
          if (ProconnectCenterEmployeeTypeRolesArray.includes(userRole)) {
            // aptrack 1 or aptrack 2 modify meta data
            metaData = await getAptrackEmployeeBookDetails({
              username: user.userId,
              role: userRole,
              brandId: brand.key, // aptrack brandKey
            });
          }
          if (ProconnectAptrackEmployeeTypeRolesArray.includes(userRole)) {
            // aptrack 1 or aptrack 2 modify meta data
            metaData = await getAptrackEmployeeProfileDetails({
              username: user.userId,
              brandId: brand.key,
            });
          }
        } else {
          // for employee with multi-role
          const userRoleData = await this.userSessionRepository.findOne({
            where: { userId: user.id },
            relations: { userRole: { brand: true } },
          });

          const activeRole = userRoleData.userRole;
          if (
            activeRole &&
            ProconnectAllEmployeeTypeRolesArray.includes(activeRole.role)
          ) {
            if (ProconnectCenterEmployeeTypeRolesArray.includes(activeRole.role)) {
              // aptrack 1 or aptrack 2 modify meta data
              metaData = await getAptrackEmployeeBookDetails({
                username: user.userId,
                role: activeRole.role,
                brandId: activeRole.brand.key, // aptrack brandKey
              });
            }

            if (ProconnectAptrackEmployeeTypeRolesArray.includes(activeRole.role)) {
              // aptrack 1 or aptrack 2 modify meta data
              metaData = await getAptrackEmployeeProfileDetails({
                username: user.userId,
                brandId: activeRole.brand.key,
              });
            }
          }
        }
        if (metaData) {
          if (metaData.userType == 'CE') {
            await this.aptrackUserService.handleNewRolesForCE(userData, metaData);
          } else if (metaData.userType == 'AE') {
            await this.aptrackUserService.handleNewRolesForAE(userData, metaData);
          }
        }
      }
    } catch (error) {
      this.logger.error(
        `updateUserMetaDataOnRefreshToken: Failed to get userMetaData for userId = ${user.userId}! ${error}`,
      );
      this.cloudLoggerService.error(
        `updateUserMetaDataOnRefreshToken: Failed to get userMetaData for userId = ${user.userId}`,
        error.toString(),
      );
    }
  }
}
