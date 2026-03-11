import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubmissionService } from './eventSubmission.service';
import { SubmissionController } from './eventSubmission.controller';
import { EventSubmission } from 'src/common/entities/eventSubmission.entity';
import { EventCourseCategory } from 'src/common/entities/eventCourseCategories.entity';
import { FileUploadModule } from 'src/file-upload/file-upload.module';
import { UserMetaData } from 'src/common/entities/user-metadata.entity';
import { OtpModule } from 'src/otp/otp.module';
import { User } from 'src/common/entities/user.entity';
import { Organization } from 'src/common/entities/origanization.entity';
import { EmailModule } from 'src/email/email.module';
import { Event } from 'src/common/entities/event.entity';
import { EventAssignToRate } from 'src/common/entities/eventAssignRole.entity';
import { EventRating } from 'src/common/entities/eventRating.entity';
import { UserBlacklist } from 'src/common/entities/user-blacklist.entity';
import { EventJury } from 'src/common/entities/eventJury.entity';
import { EventWinner } from 'src/common/entities/event-winner.entity';
import { Centre } from 'src/common/entities/centre.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Organization,
      EventSubmission,
      EventCourseCategory,
      UserMetaData,
      Event,
      EventAssignToRate,
      EventRating,
      UserBlacklist,
      EventJury,
      EventWinner,
      Centre,
    ]),
    FileUploadModule,
    OtpModule,
    EmailModule,
  ],
  providers: [SubmissionService],
  controllers: [SubmissionController],
  exports: [],
})
export class SubmissionModule {}
