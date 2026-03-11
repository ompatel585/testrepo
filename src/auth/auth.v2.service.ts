import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/common/entities/user.entity';
import { Profile } from 'src/common/entities/profile.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as constant from '../common/constants';
import { ConfigService } from '@nestjs/config';
import { BusinessException } from 'src/common/exceptions/business.exception';
import * as errorMessages from '../common/json/error-messages.json';

import { CryptoServiceUtil } from 'src/common/utils/crypto-service.util';
import { ResetPasswordV2dDto } from './dto-v2/reset-password.v2.dto';

const { AUTH_MESSAGES } = errorMessages;
const { PASSWORD_MESSAGES } = AUTH_MESSAGES;

@Injectable()
export class AuthV2Service {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Profile)
    private profileRepository: Repository<Profile>,
    private readonly cryptoService: CryptoServiceUtil,
  ) {}

  async resetPassword(userId: string, resetPasswordV2Dto: ResetPasswordV2dDto) {
    const { newPassword, confirmPassword } = resetPasswordV2Dto;
    const user = await this.userRepository.findOneBy({ userId });
    const profile = await this.profileRepository.findOneBy({
      userReference: new User({ userId }),
    });

    const isPasswordEncrypted = this.configService.get('serverConfig').ENCRYPT_PASSWORD;

    let decryptedNewPassword = newPassword;
    let decryptedConfirmPassword = confirmPassword;

    if (isPasswordEncrypted) {
      decryptedNewPassword = this.cryptoService.decryptUsingCryptoJS(
        newPassword,
        process.env.PASSWORD_ENCRYPTION_KEY,
      );
      decryptedConfirmPassword = this.cryptoService.decryptUsingCryptoJS(
        confirmPassword,
        process.env.PASSWORD_ENCRYPTION_KEY,
      );
    }

    if (decryptedNewPassword !== decryptedConfirmPassword) {
      throw new BusinessException(PASSWORD_MESSAGES.NEW_CONFIRM_NOT_MATCHING);
    }

    const isMatch = await bcrypt.compare(decryptedNewPassword, user.password);
    if (isMatch) {
      throw new BusinessException(PASSWORD_MESSAGES.OLD_NEW_PASSWORD_CANNOT_BE_SAME);
    }

    const hashedPassword = await bcrypt.hash(decryptedNewPassword, constant.SALT_ROUNDS);
    user.password = hashedPassword;
    profile.resetPasswordRequired = 0;

    await Promise.all([
      this.userRepository.save(user),
      this.profileRepository.save(profile),
    ]);
  }
}
