import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CentreWall } from 'src/common/entities/centreWall.entity';
import { CentreWallService } from './centreWall.service';
import { CentreWallController } from './centreWall.controller';
import { Event } from 'src/common/entities/event.entity';
import { FileUploadModule } from 'src/file-upload/file-upload.module';
// import { SubmissionModule } from '../eventSubmission/eventSubmission.module';
import { User } from 'src/common/entities/user.entity';
import { EventUser } from 'src/common/entities/eventUsers.entity';
import { UserMetaData } from 'src/common/entities/user-metadata.entity';
import { EventSubmission } from 'src/common/entities/eventSubmission.entity';
import { EventCourseCategory } from 'src/common/entities/eventCourseCategories.entity';
import { ScheduleModule } from '@nestjs/schedule';
import { EventRating } from 'src/common/entities/eventRating.entity';
import { EventWinner } from 'src/common/entities/event-winner.entity';
import { EventPoint } from 'src/common/entities/eventPoints.entity';
import { Centre } from 'src/common/entities/centre.entity';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([
      CentreWall,
      Event,
      User,
      EventUser,
      UserMetaData,
      EventSubmission,
      EventCourseCategory,
      EventRating,
      EventWinner,
      EventPoint,
      Centre
    ]),
    FileUploadModule,
    // SubmissionModule,
  ],
  providers: [CentreWallService],
  controllers: [CentreWallController],
})
export class CentreWallModule {}
