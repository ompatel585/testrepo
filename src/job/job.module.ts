import { Module } from '@nestjs/common';
import { JobService } from './job.service';
import { JobController } from './job.controller';
import { Job } from 'src/common/entities/job.entity';
import { JobAttachments } from 'src/common/entities/jobAttachments.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileUploadModule } from 'src/file-upload/file-upload.module';
import { JobAttachmentService } from './jobAttachment.service';
import { Company } from 'src/common/entities/company.entity';
import { Centre } from 'src/common/entities/centre.entity';
import { JobCentreMapping } from 'src/common/entities/jobCentreMapping.entity';
import { CompanyService } from 'src/company/company.service';
import { MasterService } from 'src/master/master.service';
import { Categories } from 'src/common/entities/categories.entity';
import { SkillCategory } from 'src/common/entities/skillCategory.entity';
import { Brand } from 'src/common/entities/brand.entity';
import { JobType } from 'src/common/entities/jobType.entity';
import { JobTitle } from 'src/common/entities/jobTitle.entity';
import { CompanyType } from 'src/common/entities/companyType.entity';
import { CompanyCategory } from 'src/common/entities/companyCategory.entity';
import { City } from 'src/common/entities/city.entity';
import { MasterWorkComment } from 'src/common/entities/masterWorkComment.entity';
import { LearningCircleType } from 'src/common/entities/learning-circle-type.entity';
import { MasterModule } from 'src/master/master.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Job,
      JobAttachments,
      Company,
      Centre,
      JobCentreMapping,
      Categories,
      SkillCategory,
      Brand,
      JobType,
      JobTitle,
      CompanyType,
      CompanyCategory,
      City,
      MasterWorkComment,
      LearningCircleType,
    ]),
    FileUploadModule,
    MasterModule,
  ],
  controllers: [JobController],
  providers: [JobService, JobAttachmentService, CompanyService],
  exports: [JobService],
})
export class JobModule {}
