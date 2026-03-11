import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventWinnerController } from 'src/event/WinnerDashboard/winnerDashboard.controller';
import { EventWinnerService } from 'src/event/WinnerDashboard/winnerDashboard.service';
import { EventWinner } from 'src/common/entities/event-winner.entity';
import { EventSubmission } from 'src/common/entities/eventSubmission.entity'; 
import { Event } from 'src/common/entities/event.entity';
import { EventRating } from 'src/common/entities/eventRating.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EventWinner, EventSubmission, Event,EventRating])],
  controllers: [EventWinnerController],
  providers: [ EventWinnerService],
})
export class WinnerDashboardModule {}
