import { forwardRef, Module } from '@nestjs/common';
import { MasterService } from './master.service';
import { MasterController } from './master.controller';
import { Categories } from 'src/common/entities/categories.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SkillCategory } from 'src/common/entities/skillCategory.entity';
import { JobProfile } from 'src/common/entities/jobProfile.entity';
import { Brand } from 'src/common/entities/brand.entity';
import { JobTitle } from 'src/common/entities/jobTitle.entity';
import { JobType } from 'src/common/entities/jobType.entity';
import { CompanyType } from 'src/common/entities/companyType.entity';
import { CompanyCategory } from 'src/common/entities/companyCategory.entity';
import { City } from 'src/common/entities/city.entity';
import { Centre } from 'src/common/entities/centre.entity';
import { MasterWorkComment } from 'src/common/entities/masterWorkComment.entity';
import { LearningCircleType } from 'src/common/entities/learning-circle-type.entity';
import { TaxonomyBrand } from 'src/common/entities/taxonomyBrand.entity';
import { TaxonomyBrandCategory } from 'src/common/entities/taxonomyBrandCategory.entity';
import { CourseModule } from 'src/common/entities/courseModule.entity';
import { PaymentOption } from 'src/common/entities/paymentOption.entity';
import { User } from 'src/common/entities/user.entity';
import { EventStatus } from 'src/common/entities/eventStatus.entity';
import { CourseCategory } from 'src/common/entities/courseCategories.entity';
import { EventCourseCategory } from 'src/common/entities/eventCourseCategories.entity';
import { Event } from 'src/common/entities/event.entity';
import { ComplaintCategories } from 'src/common/entities/complaintCategories.entity';
import { Complaint } from 'src/common/entities/complaint.entity';
import { CoursesModule } from 'src/course/courses.module';
import { FileUploadModule } from 'src/file-upload/file-upload.module';
import { DrmModule } from 'src/admin/drm/drm.module';
import { CloudLoggerModule } from 'src/cloud-logger/cloud-logger.module';
import { EmailModule } from 'src/email/email.module';
import { MasterWorkController } from './master.work.controller';
import { WorkCategory } from 'src/common/entities/workCategory.entity';
import { MasterWorkService } from './master.work.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Categories,
      SkillCategory,
      JobProfile,
      JobTitle,
      Brand,
      JobType,
      City,
      CompanyType,
      CompanyCategory,
      Centre,
      MasterWorkComment,
      LearningCircleType,
      TaxonomyBrand,
      TaxonomyBrandCategory,
      CourseModule,
      PaymentOption,
      User,
      Event,
      EventStatus,
      EventCourseCategory,
      CourseCategory,
      Complaint,
      ComplaintCategories,
      WorkCategory,
    ]),
    forwardRef(() => CoursesModule),
    DrmModule,
    FileUploadModule,
    CloudLoggerModule,
    EmailModule,
  ],
  controllers: [MasterController, MasterWorkController],
  providers: [MasterService, MasterWorkService],
  exports: [MasterService],
})
export class MasterModule {}
