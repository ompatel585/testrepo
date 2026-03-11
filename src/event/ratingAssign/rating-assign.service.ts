import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Event, EventStatus } from 'src/common/entities/event.entity';
import { In, MoreThan, Repository } from 'typeorm';
import { JuryRole, RatingStatus } from 'src/common/entities/eventRating.entity';
import {
  EventSubmission,
  SubmissionStatus,
} from 'src/common/entities/eventSubmission.entity';
import { User } from 'src/common/entities/user.entity';
import {
  EventAssignToRate,
  RatingStatusEnum,
} from 'src/common/entities/eventAssignRole.entity';
import { AssignSubmissionDto } from '../dto/assign-submission.dto';
import { EventJury } from 'src/common/entities/eventJury.entity';

@Injectable()
export class AssignRatingService {
  private readonly logger = new Logger(AssignRatingService.name);
  private juryType = JuryRole.INTERNAL;

  constructor(
    @InjectRepository(Event)
    private readonly eventRepo: Repository<Event>,
    @InjectRepository(EventAssignToRate)
    private readonly assignRepo: Repository<EventAssignToRate>,
    @InjectRepository(EventSubmission)
    private readonly submissionRepo: Repository<EventSubmission>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(EventJury)
    private readonly eventJuryRepo: Repository<EventJury>,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleCron() {
    const toggleMap = {
      [JuryRole.INTERNAL]: JuryRole.EXTERNAL,
      [JuryRole.EXTERNAL]: JuryRole.INTERNAL,
    };
    const today = new Date().toISOString().split('T')[0];

    const events = await this.eventRepo.find({
      where: { eventStatus: EventStatus.ACTIVE, endDate: MoreThan(today) },
    });

    for (const event of events) {
      const param: AssignSubmissionDto = {
        eventId: event.id,
        juryType: this.juryType,
        brandId: event.brandId,
      };
      const res = await this.assignSubmission(param);
      this.logger.debug(
        `Assigned to ${this.juryType} for event ${event.id}: ${JSON.stringify(res)}`,
      );
    }

    this.juryType = toggleMap[this.juryType];
  }

  /** Fetch existing assignments for multiple submissions at once */
  private async getExistingAssignmentsMap(
    submissionIds: number[],
    juryIds: string[],
    juryType: JuryRole,
  ) {
    const existing = await this.assignRepo.find({
      where: {
        submissionId: In(submissionIds),
        juryId: In(juryIds),
        juryType,
      },
    });

    const map = new Set(existing.map((e) => `${e.juryId}-${e.submissionId}`));
    return map;
  }

  /** Even distribution + random extras */
  private distributeEvenly<T>(items: T[], buckets: number): T[][] {
    const alignedCount = Math.floor(items.length / buckets) * buckets;
    const aligned = items.slice(0, alignedCount);
    const extras = items.slice(alignedCount);

    const perBucket = alignedCount / buckets;
    const result: T[][] = Array.from({ length: buckets }, (_, i) =>
      aligned.slice(i * perBucket, (i + 1) * perBucket),
    );

    // Randomly assign extras
    extras.forEach((item) => {
      const randomIndex = Math.floor(Math.random() * buckets);
      result[randomIndex].push(item);
    });

    return result;
  }

  private async assignToInternal(submissions: EventSubmission[], users: User[]) {
    if (!users.length) return { message: 'No juries found' };

    // Get all category/event/submission combos that already have INTERNAL jury
    const existingInternalAssignments = await this.assignRepo
      .createQueryBuilder('assign')
      .select([
        'assign.categoryId',
        'assign.eventId',
        'assign.submissionId',
        'assign.juryType',
      ])
      .where('assign.juryType = :juryType', { juryType: JuryRole.INTERNAL })
      .getRawMany();

    const existingComboSet = new Set(
      existingInternalAssignments.map(
        (e) =>
          `${e.assign_categoryId}-${e.assign_eventId}-${e.assign_submissionId}-${e.assign_juryType}`,
      ),
    );

    const assignments: EventAssignToRate[] = [];
    const distributed = this.distributeEvenly(submissions, users.length);

    distributed.forEach((bucket, idx) => {
      const juryId = users[idx].userId;
      bucket.forEach((sub) => {
        const comboKey = `${sub.categoryId}-${sub.eventId}-${sub.id}-${JuryRole.INTERNAL}`;
        if (!existingComboSet.has(comboKey)) {
          assignments.push(
            this.assignRepo.create({
              submissionId: sub.id,
              categoryId: sub.categoryId,
              eventId: sub.eventId,
              juryId,
              juryType: JuryRole.INTERNAL,
              ratingStatus: RatingStatusEnum.NOT_RATED,
            }),
          );
          existingComboSet.add(comboKey); // prevent duplicates in the same batch
        }
      });
    });

    if (assignments.length) {
      await this.assignRepo.save(assignments);
    }

    return {
      message: 'Assignment completed',
      totalSubmissions: submissions.length,
      assignedSubmissions: assignments.length,
    };
  }

  private async assignToExternal(submissions: EventSubmission[], users: any[]) {
    if (!users.length) return { message: 'No juries found' };

    const juryIds = users.map((u) => u.userId);
    const existingMap = await this.getExistingAssignmentsMap(
      submissions.map((s) => s.id),
      juryIds,
      JuryRole.EXTERNAL,
    );

    const assignments: EventAssignToRate[] = [];

    submissions.forEach((sub) => {
      users.forEach((user) => {
        if (
          user.expertsIn.includes(sub.categoryId) &&
          !existingMap.has(`${user.userId}-${sub.id}`)
        ) {
          assignments.push(
            this.assignRepo.create({
              submissionId: sub.id,
              categoryId: sub.categoryId,
              eventId: sub.eventId,
              juryId: user.userId,
              juryType: JuryRole.EXTERNAL,
              ratingStatus: RatingStatusEnum.NOT_RATED,
            }),
          );
        }
      });
    });

    if (assignments.length) {
      await this.assignRepo.save(assignments);
    }

    return {
      message: 'Assignment completed',
      totalSubmissions: submissions.length,
      assignedSubmissions: assignments.length,
    };
  }

  async assignSubmission(payload: AssignSubmissionDto) {
    const { eventId, juryType, brandId } = payload;

    const submissionQB = this.submissionRepo
      .createQueryBuilder('submission')
      .where('submission."submissionStatus"::text = :submissionStatus', {
        submissionStatus: SubmissionStatus.SUBMITTED,
      })
      .andWhere('submission.eventId = :eventId', { eventId })
      .orderBy('submission.id', 'ASC');

    if (juryType === JuryRole.EXTERNAL) {
      submissionQB
        .innerJoinAndSelect('submission.ratings', 'rating')
        .andWhere('rating.juryRole = :juryRole', { juryRole: JuryRole.INTERNAL })
        .andWhere('rating."status"::text = :ratingStatus', {
          ratingStatus: RatingStatus.PUBLISH,
        });
    }

    // const [sql, params] = submissionQB.getQueryAndParameters();
    // console.log('SQL:', sql);
    // console.log('Params:', params);

    const submissions = await submissionQB.getMany();

    if (!submissions.length) {
      return { message: 'No submissions found', totalSubmissions: 0 };
    }

    if (juryType === JuryRole.INTERNAL) {
      const users = await this.userRepo
        .createQueryBuilder('user')
        .where('user.roles && :roles', { roles: [juryType] })
        .andWhere('user.brandId = :brandId', { brandId })
        .getMany();
      return this.assignToInternal(submissions, users);
    } else {
      const juries = await this.eventJuryRepo
        .createQueryBuilder('eventJury')
        .innerJoinAndSelect('eventJury.user', 'user')
        .where('eventJury.juryRole = :role', { role: juryType })
        .andWhere('user.brandId = :brandId', { brandId })
        .getMany();

      const users = juries.map((j) => ({
        ...j.user,
        expertsIn: JSON.parse(j.expertsIn || '[]'),
      }));

      return this.assignToExternal(submissions, users);
    }
  }
}
