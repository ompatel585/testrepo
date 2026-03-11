import { Module } from '@nestjs/common';
import { BookController } from './book.controller';
import { BookService } from './book.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseModule } from 'src/common/entities/courseModule.entity';
import { FileUploadModule } from 'src/file-upload/file-upload.module';
import { MasterModule } from 'src/master/master.module';
import { CoursesModule } from 'src/course/courses.module';
import { DrmModule } from '../drm/drm.module';
import { UserRole } from 'src/common/entities/userRole.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CourseModule, UserRole]),
    FileUploadModule,
    MasterModule,
    CoursesModule,
    DrmModule,
  ],
  controllers: [BookController],
  providers: [BookService],
  exports: [BookService],
})
export class BookModule {}
