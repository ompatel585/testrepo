import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EventWinner } from 'src/common/entities/event-winner.entity';
import { Repository } from 'typeorm';
import { CreateEventWinnerDto } from 'src/event/dto/create-event-winner.dto';
import { EventSubmission } from 'src/common/entities/eventSubmission.entity';
import { Event } from 'src/common/entities/event.entity';
import { EventRating } from 'src/common/entities/eventRating.entity';

@Injectable()
export class EventWinnerService {
  constructor(
    @InjectRepository(EventWinner)
    private readonly eventWinnerRepo: Repository<EventWinner>,
    @InjectRepository(EventSubmission)
    private submissionRepo: Repository<EventSubmission>,
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    @InjectRepository(EventRating)
    private readonly eventratingRepository: Repository<EventRating>,
  ) { }

  async createWinner(dto: CreateEventWinnerDto): Promise<any> {
    const { categoryId, eventId, studentId, winner, runnerUp, submissionId, ratingId } = dto;

    if (winner === 1 && runnerUp === 1) {
      throw new BadRequestException('Student cannot be both winner and runner-up.');
    }

    const submission = await this.submissionRepo.findOne({ where: { id: submissionId } });
    if (!submission) throw new BadRequestException('Invalid submission ID');
    if (submission.studentId !== studentId) {
      throw new BadRequestException('Student ID does not match the submission.');
    }

    const rating = await this.eventratingRepository.findOne({
      where: { id: ratingId },
      relations: ['submission'],
    });

    if (!rating || rating.submission.id !== submissionId) {
      throw new BadRequestException('Invalid rating ID for this submission.');
    }

    const event = await this.eventRepository.findOne({ where: { id: eventId } });
    if (!event) throw new BadRequestException('Invalid event ID');

    const categoryConfig = event.categoryConfig?.[categoryId] || {
      winner: 1,
      runnerUp: 2,
    };

    const existingEntry = await this.eventWinnerRepo.findOne({
      where: { eventId, categoryId, studentId },
    });

    if (winner === 0 && runnerUp === 0) {
      if (existingEntry) {
        await this.eventWinnerRepo.remove(existingEntry);
        return {
          unchecked: true,
          studentId,
          message: 'Student unchecked from winner/runner-up list.',
        };
      } else {
        return {
          unchecked: true,
          studentId,
          message: 'No existing winner/runner-up entry found to remove.',
        };
      }
    }
  
    if (winner === 1) {
      const existingWinners = await this.eventWinnerRepo.find({
        where: { categoryId, eventId, winner: 1 },
      });

      const alreadyIncluded = existingWinners.some(w => w.studentId === studentId);

      if (!alreadyIncluded && existingWinners.length >= categoryConfig.winner) {
        throw new BadRequestException(
          `Only ${categoryConfig.winner} winner${categoryConfig.winner > 1 ? 's are' : ' is'} allowed. Please uncheck an existing winner first.`,
        );
      }
    }

    if (runnerUp === 1) {
      const existingRunnerUps = await this.eventWinnerRepo.find({
        where: { categoryId, eventId, runnerUp: 1 },
      });

      const alreadyIncluded = existingRunnerUps.some(r => r.studentId === studentId);

      if (!alreadyIncluded && existingRunnerUps.length >= categoryConfig.runnerUp) {
        throw new BadRequestException(
          `Only ${categoryConfig.runnerUp} runner-up${categoryConfig.runnerUp > 1 ? ' are' : ' is'} allowed. Please uncheck an existing runner-up first.`,
        );
      }
    }

    let newEntry;
    if (existingEntry) {
      existingEntry.winner = winner;
      existingEntry.runnerUp = runnerUp;
      newEntry = existingEntry;
    } else {
      newEntry = this.eventWinnerRepo.create({
        eventId,
        categoryId,
        studentId,
        winner,
        runnerUp,
        submissionId,
        ratingId,
      });
    }

    const saved = await this.eventWinnerRepo.save(newEntry);

    return {
      unchecked: false,
      data: saved,
      message: 'Student added as winner/runner-up.',
    };
  }

}