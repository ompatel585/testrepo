import { Module } from '@nestjs/common';
import { AssignRatingService } from './rating-assign.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from 'src/common/entities/event.entity';
import { EventAssignToRate } from 'src/common/entities/eventAssignRole.entity';
import { EventSubmission } from 'src/common/entities/eventSubmission.entity';
import { User } from 'src/common/entities/user.entity';
import { EventJury } from 'src/common/entities/eventJury.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Event,
      EventAssignToRate,
      EventSubmission,
      User,
      EventJury,
    ]),
  ],
  providers: [AssignRatingService],
})
export class AssignRatingModule {}
