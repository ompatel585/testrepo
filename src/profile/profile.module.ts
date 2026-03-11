import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { Profile } from 'src/common/entities/profile.entity';
import { Organization } from 'src/common/entities/origanization.entity';
import { User } from 'src/common/entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { OtpModule } from 'src/otp/otp.module';
import { FileUploadModule } from 'src/file-upload/file-upload.module';
import { MasterModule } from 'src/master/master.module';
import { UsersModule } from 'src/users/users.module';
import { UserMetaData } from 'src/common/entities/user-metadata.entity';
import { CloudLoggerModule } from 'src/cloud-logger/cloud-logger.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Organization, Profile, UserMetaData]),
    JwtModule,
    OtpModule,
    FileUploadModule,
    MasterModule,
    forwardRef(() => UsersModule),
    CloudLoggerModule,
  ],
  controllers: [ProfileController],
  providers: [ProfileService],
  exports: [ProfileService],
})
export class ProfileModule {}
