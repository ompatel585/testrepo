import { Module, forwardRef } from '@nestjs/common';
import { EmailModule } from 'src/email/email.module';
import { SMSModule } from 'src/sms/sms.module';
import { UsersModule } from 'src/users/users.module';
import { User } from 'src/common/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import * as constant from '../common/constants';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { OtpService } from './otp.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    EmailModule,
    SMSModule,
    forwardRef(() => UsersModule),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('jwtConfig').JWT_STRATEGY_SECRET,
        signOptions: { expiresIn: constant.OTP_EXPIRES_IN },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [OtpService],
  exports: [OtpService],
})
export class OtpModule {}
