import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JsonWebTokenError, JwtService, TokenExpiredError } from '@nestjs/jwt';
import { generateOtp } from 'src/common/helper/index.helper';
import * as constant from 'src/common/constants';
import { ConfigService } from '@nestjs/config';
import { SMSService } from 'src/sms/sms.service';
import { mobileNumberVerificationOtpTemplate } from 'src/sms/templates/otp-sms.template';
import { emailVerifyOtpTemplate } from 'src/email/templates/otp-email.template';
import { EmailService } from 'src/email/email.service';
import { BusinessException } from 'src/common/exceptions/business.exception';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AUTH_MESSAGES } from '../common/json/error-messages.json';
const { MOBILE_MESSAGES, EMAIL_MESSAGES } = AUTH_MESSAGES;

@Injectable()
export class OtpService {
  constructor(
    private jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly smsService: SMSService,
    private emailService: EmailService,
    private eventEmitter: EventEmitter2,
  ) {}

  async generateOtpToken(type: 'email' | 'mobile', value: string, payload = {}) {
    const otp = generateOtp();
    const token = await this.jwtService.signAsync(
      { ...payload, [type.concat('Otp')]: otp, [type]: value },
      {
        secret: this.configService.get('jwtConfig').OTP_SECRET,
        expiresIn: constant.OTP_EXPIRES_IN,
      },
    );

    return [token, otp];
  }

  async sendMobileOtp(mobile, payload = {}) {
    const [mobileToken, mobileOtp] = await this.generateOtpToken(
      'mobile',
      mobile,
      payload,
    );
    await this.smsService.sendSMS(mobileNumberVerificationOtpTemplate(mobileOtp), mobile);

    return [mobileToken];
  }

  async sendEmailOtp(email, payload = {}) {
    const [emailToken, emailOtp] = await this.generateOtpToken('email', email, payload);

    const msg = {
      to: email,
      from: constant.FROM_EMAIL_ID,
      subject: 'OTP Confirmation!',
      html: emailVerifyOtpTemplate(emailOtp),
    };

    await this.emailService.sendEmail(msg);

    return [emailToken];
  }

  async verifyMobileOtp(mobileOtp, mobile, mobileToken) {
    try {
      const decodedMobileToken = await this.jwtService.verifyAsync(mobileToken, {
        secret: this.configService.get('jwtConfig').OTP_SECRET,
      });
      if (
        decodedMobileToken.mobileOtp != mobileOtp ||
        decodedMobileToken.mobile != mobile
      ) {
        throw new BusinessException(MOBILE_MESSAGES.INVALID_MOBILE_OTP);
      }
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new BusinessException(MOBILE_MESSAGES.EXPIRED_MOBILE_OTP);
      } else if (error instanceof JsonWebTokenError) {
        throw new BusinessException(MOBILE_MESSAGES.INVALID_MOBILE_TOKEN);
      } else {
        throw error;
      }
    }
  }

  async verifyEmailOtp(emailOtp, email, emailToken) {
    try {
      const decodedEmailToken = await this.jwtService.verifyAsync(emailToken, {
        secret: this.configService.get('jwtConfig').OTP_SECRET,
      });
      if (decodedEmailToken.emailOtp != emailOtp || decodedEmailToken.email != email) {
        throw new BusinessException(EMAIL_MESSAGES.INVALID_EMAIL_OTP);
      }
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new BusinessException(EMAIL_MESSAGES.EXPIRED_EMAIL_OTP);
      } else if (error instanceof JsonWebTokenError) {
        throw new BusinessException(EMAIL_MESSAGES.INVALID_EMAIL_TOKEN);
      } else {
        throw error;
      }
    }
  }
}
