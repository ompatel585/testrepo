import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { LocalStrategy } from 'src/common/strategy/local.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { JwtStrategy } from 'src/common/strategy/jwt.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/common/entities/user.entity';
import { Organization } from 'src/common/entities/origanization.entity';
import { LocalOrgStrategy } from 'src/common/strategy/local-org.strategy';
import { LocalGuestStrategy } from 'src/common/strategy/local-guest.strategy';
import * as constant from '../common/constants';
import { OtpModule } from 'src/otp/otp.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EmailModule } from 'src/email/email.module';
import { SMSModule } from 'src/sms/sms.module';
import { Profile } from 'src/common/entities/profile.entity';
import { ServiceAccess } from 'src/common/entities/service-access.entity';
import { CloudLoggerModule } from 'src/cloud-logger/cloud-logger.module';
import { CryptoServiceUtil } from 'src/common/utils/crypto-service.util';
import { MasterModule } from 'src/master/master.module';
import { UserActivityModule } from 'src/user-activity/userActivity.module';
import { AuthV2Service } from './auth.v2.service';
import { AuthV2Controller } from './auth.v2.controller';
import { JwtRefreshTokenStrategy } from 'src/common/strategy/jwt-refresh-token.strategy';
import { UserSession } from 'src/common/entities/userSession.entity';
import { RedisCacheModule } from 'src/cache/redis-cache.module';
import { AuthCredUpdateService } from './auth.cred-update.service';
import { UserRole } from 'src/common/entities/userRole.entity';
import { M365AuthService } from './m365-auth.service';
// import { SMSModule } from 'src/sms/sms.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Organization,
      Profile,
      ServiceAccess,
      UserSession,
      UserRole,
    ]),
    UsersModule,
    PassportModule,
    // registerAsync returns dynamic module
    JwtModule.registerAsync({
      // importing config module to access .env variables
      imports: [ConfigModule],
      // returns the optional object used for configuration example: {secret, signOptions}
      useFactory: async (configService: ConfigService) => {
        return {
          secret: configService.get('jwtConfig').JWT_STRATEGY_SECRET,
          signOptions: {
            expiresIn: configService.get('jwtConfig').JWT_ACCESS_TOKEN_EXPIRES_IN,
          },
        };
      },
      // inject the dependency service
      inject: [ConfigService],
    }),
    OtpModule,
    EmailModule,
    SMSModule,
    CloudLoggerModule,
    MasterModule,
    UserActivityModule,
    RedisCacheModule,
  ],
  controllers: [AuthController, AuthV2Controller],
  providers: [
    AuthService,
    AuthV2Service,
    LocalStrategy,
    LocalOrgStrategy,
    LocalGuestStrategy,
    JwtStrategy,
    CryptoServiceUtil,
    JwtRefreshTokenStrategy,
    AuthCredUpdateService,
    M365AuthService
  ],
})
export class AuthModule {}
