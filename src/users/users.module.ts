import { forwardRef, Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/common/entities/user.entity';
import { Organization } from 'src/common/entities/origanization.entity';
import { EmailModule } from 'src/email/email.module';
import { FileUploadModule } from 'src/file-upload/file-upload.module';
import { Profile } from 'src/common/entities/profile.entity';
import { ProfileModule } from 'src/profile/profile.module';
import { WorkModule } from 'src/work/work.module';
import { PortfolioModule } from 'src/portfolio/portfolio.module';
import { ServiceAccess } from 'src/common/entities/service-access.entity';
import { FollowController } from './follow.controller';
import { FollowService } from './follow.service';
import { Follow } from 'src/common/entities/follow.entity';
import { UserMetaData } from 'src/common/entities/user-metadata.entity';
import { UserAccessValidationService } from './user-access-validation.service';
import { CloudLoggerModule } from 'src/cloud-logger/cloud-logger.module';
import { UserSession } from 'src/common/entities/userSession.entity';
import { MasterModule } from 'src/master/master.module';
import { RedisCacheModule } from 'src/cache/redis-cache.module';
import { AptrackUserService } from './aptrack-user.service';
import { UserRole } from 'src/common/entities/userRole.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Organization,
      Profile,
      ServiceAccess,
      Follow,
      UserMetaData,
      UserSession,
      UserRole,
    ]),
    EmailModule,
    FileUploadModule,
    forwardRef(() => ProfileModule),
    WorkModule,
    CloudLoggerModule,
    MasterModule,
    forwardRef(() => PortfolioModule),
    RedisCacheModule,
  ],
  providers: [
    UsersService,
    UserAccessValidationService,
    FollowService,
    AptrackUserService,
  ],
  controllers: [UsersController, FollowController],
  exports: [UsersService, UserAccessValidationService, AptrackUserService],
})
export class UsersModule {}
