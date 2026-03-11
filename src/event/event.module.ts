import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventController } from './event.controller';
import { EventService } from './event.service';
import { Event } from 'src/common/entities/event.entity';
import { FileUploadModule } from 'src/file-upload/file-upload.module';
import { UserMetaData } from 'src/common/entities/user-metadata.entity';
import { EventCourseCategory } from 'src/common/entities/eventCourseCategories.entity';
import { EventSubmission } from 'src/common/entities/eventSubmission.entity';
import { User } from 'src/common/entities/user.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Event,
      User,
      UserMetaData,
      EventCourseCategory,
      EventSubmission,
    ]),
    FileUploadModule,
  ],
  controllers: [EventController],
  providers: [EventService],
})
export class EventModule {}
