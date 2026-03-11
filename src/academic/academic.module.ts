import { Module } from '@nestjs/common';
import { AcademicController } from './academic.controller';
import { AcademicService } from './academic.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Fee } from 'src/common/entities/fee.entity';
import { FileUploadModule } from 'src/file-upload/file-upload.module';
import { User } from 'src/common/entities/user.entity';
import { CoursesModule } from 'src/course/courses.module';
import { UserMetaData } from 'src/common/entities/user-metadata.entity';
import { MasterModule } from 'src/master/master.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Fee, User, UserMetaData]),
    FileUploadModule,
    CoursesModule,
    MasterModule,
    UsersModule,
  ],
  controllers: [AcademicController],
  providers: [AcademicService],
})
export class AcademicModule {}
