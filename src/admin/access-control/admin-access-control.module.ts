import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/common/entities/user.entity';
import { Profile } from 'src/common/entities/profile.entity';
import { CryptoServiceUtil } from 'src/common/utils/crypto-service.util';
import { AdminAccessControlController } from './admin-access-control.controller';
import { AdminAccessControlService } from './admin-access-control.service';
import { UsersModule } from 'src/users/users.module';
import { CloudLoggerModule } from 'src/cloud-logger/cloud-logger.module';
import { RedisCacheModule } from 'src/cache/redis-cache.module';
import { CoursesModule } from 'src/course/courses.module';
import { UserMetaData } from 'src/common/entities/user-metadata.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Profile, UserMetaData]),
    UsersModule,
    CloudLoggerModule,
    RedisCacheModule,
    CoursesModule,
  ],
  controllers: [AdminAccessControlController],
  providers: [AdminAccessControlService, CryptoServiceUtil],
})
export class AdminAccessControlModule {}
