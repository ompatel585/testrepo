import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/common/entities/user.entity';
import { OtpService } from 'src/otp/otp.service';
import { Repository } from 'typeorm';
import { ContactType, VerifyUserAndSendOTP } from './dto/verify-send-otp.dto';
import { VerifyUserAndUpdatePass } from './dto/verify-otp-update-password.dto';
import * as bcrypt from 'bcrypt';
import * as constant from '../common/constants';
import { passwordUpdateEmailTemplate } from 'src/email/templates/password-update-email.template';
import { SMSService } from 'src/sms/sms.service';
import { EmailService } from 'src/email/email.service';
import { passwordUpdateSmsTemplate } from 'src/sms/templates/password-update-sms.template';
import { Role } from 'src/common/enum/role.enum';
import { getStudentMetaDataRedisKeyFromAptrackByBrandId } from 'src/cache/redis-keys';
import { RedisCacheService } from 'src/cache/redis-cache.service';
import { getStudentDetails } from 'src/common/external-services/aptrack-one/endpoints';
import { IStudentMetaData } from 'src/common/entities/user-metadata.entity';
import { BusinessException } from 'src/common/exceptions/business.exception';
import { VerifyUserOTP } from './dto/verify-user-otp';
import { DefaultUserResponse } from 'src/common/strategy/jwt.strategy';
import { v4 as uuidv4 } from 'uuid';
import { JwtService } from '@nestjs/jwt';
import { UserSession } from 'src/common/entities/userSession.entity';
import { UserRole } from 'src/common/entities/userRole.entity';
@Injectable()
export class AuthCredUpdateService {
  private readonly logger = new Logger(AuthCredUpdateService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private otpService: OtpService,
    private emailService: EmailService,
    private readonly smsService: SMSService,
    private readonly redisCache: RedisCacheService,
    private jwtService: JwtService,

    @InjectRepository(UserSession)
    private userSessionRepository: Repository<UserSession>,
    @InjectRepository(UserRole)
    private userRoleRepository: Repository<UserRole>,
  ) {}

  async verifyUserAndSendOTP(verifyUserAndSendOTP: VerifyUserAndSendOTP) {
    const user = await this.userRepository.findOne({
      relations: { profile: true, userRole: true },
      where: {
        userRole: {
          role: Role.Student,
          ...(verifyUserAndSendOTP.brandKey && {
            brand: { key: verifyUserAndSendOTP.brandKey },
          }),
        },
        userId: verifyUserAndSendOTP.userId,
      },
    });

    if (!user) {
      throw new BusinessException('user not found.');
    }

    const isValidCreds =
      verifyUserAndSendOTP.type === ContactType.EMAIL
        ? user.profile.email === verifyUserAndSendOTP.data
        : user.profile.mobile === verifyUserAndSendOTP.data;

    if (!isValidCreds) {
      throw new BusinessException(
        verifyUserAndSendOTP.type === ContactType.EMAIL
          ? 'invalid email.'
          : 'invalid mobile number.',
      );
    }

    let token = null;
    const message = `Enter 4-digit OTP sent to ${verifyUserAndSendOTP.data}`;

    if (verifyUserAndSendOTP.type == ContactType.EMAIL) {
      [token] = await this.otpService.sendEmailOtp(verifyUserAndSendOTP.data, {
        data: verifyUserAndSendOTP.data,
      });
    } else {
      [token] = await this.otpService.sendMobileOtp(verifyUserAndSendOTP.data, {
        data: verifyUserAndSendOTP.data,
      });
    }

    return {
      isValidUser: true,
      message,
      token,
    };
  }

  async verifyUserAndUpdateUserPass(verifyUserAndUpdatePass: VerifyUserAndUpdatePass) {
    // fetch user or not found
    const profileFilter =
      verifyUserAndUpdatePass.type === ContactType.EMAIL
        ? { email: verifyUserAndUpdatePass.data }
        : { mobile: verifyUserAndUpdatePass.data };

    const user = await this.userRepository.findOne({
      relations: { profile: true, userRole: { brand: true } },
      where: {
        userRole: { role: Role.Student },
        userId: verifyUserAndUpdatePass.userId,
      },
    });

    if (!user) {
      throw new BusinessException('user not found.');
    }

    const isValidCreds =
      verifyUserAndUpdatePass.type === ContactType.EMAIL
        ? user.profile.email === verifyUserAndUpdatePass.data
        : user.profile.mobile === verifyUserAndUpdatePass.data;

    if (!isValidCreds) {
      throw new BusinessException(
        verifyUserAndUpdatePass.type === ContactType.EMAIL
          ? 'invalid email.'
          : 'invalid mobile number.',
      );
    }

    if (verifyUserAndUpdatePass.type === ContactType.EMAIL) {
      await this.otpService.verifyEmailOtp(
        verifyUserAndUpdatePass.otp,
        verifyUserAndUpdatePass.data,
        verifyUserAndUpdatePass.token,
      );
    }

    if (verifyUserAndUpdatePass.type === ContactType.MOBILE) {
      await this.otpService.verifyMobileOtp(
        verifyUserAndUpdatePass.otp,
        verifyUserAndUpdatePass.data,
        verifyUserAndUpdatePass.token,
      );
    }

    // fetch metadata for bc as pass
    let metaData: IStudentMetaData = null;
    // basis brandId 1 or 2
    const metaDataRedisKey = getStudentMetaDataRedisKeyFromAptrackByBrandId(
      user.userRole[0].brand.key, // aptrack brandKey
      user.userId,
    );

    let redisMetaData = await this.redisCache.get(metaDataRedisKey);

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
        user.userRole[0].brand.key, // aptrack brandKey
      );

      metaData = Array.isArray(studentMetaData) ? studentMetaData[0] : studentMetaData;
    }

    const password = metaData.BC[0].BCNo;

    let hashedPassword = await bcrypt.hash(password, constant.SALT_ROUNDS);

    // update pass
    await this.userRepository.update(
      { userId: verifyUserAndUpdatePass.userId },
      { password: hashedPassword },
    );

    // send email | sms
    if (verifyUserAndUpdatePass.type === ContactType.MOBILE) {
      await this.smsService.sendSMS(
        passwordUpdateSmsTemplate(verifyUserAndUpdatePass.userId, password),
        verifyUserAndUpdatePass.data,
      );
    }

    if (verifyUserAndUpdatePass.type === ContactType.EMAIL) {
      const msg = {
        to: verifyUserAndUpdatePass.data,
        from: constant.FROM_EMAIL_ID,
        subject: 'Password Updated Successfully!',
        html: passwordUpdateEmailTemplate(verifyUserAndUpdatePass.userId, password),
      };

      await this.emailService.sendEmail(msg);
    }

    return {
      isValidUser: true,
      message: `Your updated credentials have been successfully shared with your registered ${verifyUserAndUpdatePass.type === ContactType.EMAIL ? 'email address' : 'mobile number'}.`,
      creds: { userId: verifyUserAndUpdatePass.userId, password: password },
    };
  }

  async verifyUserOTP(verifyUserOTP: VerifyUserOTP) {
    // fetch user or not found
    const profileFilter =
      verifyUserOTP.type === ContactType.EMAIL
        ? { email: verifyUserOTP.data }
        : { mobile: verifyUserOTP.data };

    const user = await this.userRepository.findOne({
      relations: { profile: true, userRole: { brand: true } },
      where: {
        userRole: {
          role: Role.Student,
          ...(verifyUserOTP.brandKey && {
            brand: { key: verifyUserOTP.brandKey },
          }),
        },
        userId: verifyUserOTP.userId,
      },
    });

    if (!user) {
      throw new BusinessException('user not found.');
    }

    const isValidCreds =
      verifyUserOTP.type === ContactType.EMAIL
        ? user.profile.email === verifyUserOTP.data
        : user.profile.mobile === verifyUserOTP.data;

    if (!isValidCreds) {
      throw new BusinessException(
        verifyUserOTP.type === ContactType.EMAIL
          ? 'invalid email.'
          : 'invalid mobile number.',
      );
    }

    if (verifyUserOTP.type === ContactType.EMAIL) {
      await this.otpService.verifyEmailOtp(
        verifyUserOTP.otp,
        verifyUserOTP.data,
        verifyUserOTP.token,
      );
    }

    if (verifyUserOTP.type === ContactType.MOBILE) {
      await this.otpService.verifyMobileOtp(
        verifyUserOTP.otp,
        verifyUserOTP.data,
        verifyUserOTP.token,
      );
    }

    // create access-token 2hr validity
    // JTI (JWT-ID) per login session!
    const jwtId = uuidv4();

    const payload: DefaultUserResponse = {
      id: user.id,
      userId: user.userId,
      fetchMetadata: user.fetchMetadata,
      jti: jwtId,
      userType: user.userType,
      activeRole: null,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: constant.BOT_TOKEN_EXPIRES_IN,
    });

    return {
      isValidUser: true,
      message: `user verified successfully`,
      access_token: accessToken,
    };
  }
}
