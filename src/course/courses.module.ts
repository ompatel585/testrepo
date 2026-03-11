import { forwardRef, Module } from '@nestjs/common';
import { CourseController } from './course.controller';
import { CourseService } from './course.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseModule } from 'src/common/entities/courseModule.entity';
import { FileUploadModule } from 'src/file-upload/file-upload.module';
import { UserMetaData } from 'src/common/entities/user-metadata.entity';
import { DrmModule } from 'src/admin/drm/drm.module';
import { MasterModule } from 'src/master/master.module';
import { UsersModule } from 'src/users/users.module';
import { UserRole } from 'src/common/entities/userRole.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CourseModule, UserMetaData, UserRole]),
    FileUploadModule,
    DrmModule,
    forwardRef(() => MasterModule),
    forwardRef(() => UsersModule),
  ],
  controllers: [CourseController],
  providers: [CourseService],
  exports: [CourseService],
})
export class CoursesModule {}
