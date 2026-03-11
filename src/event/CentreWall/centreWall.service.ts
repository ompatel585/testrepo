import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CentreWall } from 'src/common/entities/centreWall.entity';
import { CreateCentreWallDto } from '../dto/create-centreWall.dto';
import { Event, EventStatus } from 'src/common/entities/event.entity';
import { FileUploadService } from 'src/file-upload/file-upload.service';
import {
  EventSubmission,
  SubmissionStatus,
} from 'src/common/entities/eventSubmission.entity';
import { UpdateCentreWallDto } from '../dto/updateCentreWall.dto';
import path from 'path';
import { User } from 'src/common/entities/user.entity';
import { EventUser } from 'src/common/entities/eventUsers.entity';
import { UserMetaData } from 'src/common/entities/user-metadata.entity';
import { EventCourseCategory } from 'src/common/entities/eventCourseCategories.entity';
import { QueryParamsDto } from 'src/common/dto/query-params.dto';
import { CenterDashboardFilterDto } from '../dto/centre-wall-filter.dto';
import {
  EventRating,
  JuryRole,
  RatingStatus,
} from 'src/common/entities/eventRating.entity';
import { EventWinner } from 'src/common/entities/event-winner.entity';
import { EventPoint } from 'src/common/entities/eventPoints.entity';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Logger } from '@nestjs/common';
import { Centre } from 'src/common/entities/centre.entity';

interface CenterPointsView {
  centerId: number;
  eventId: number;
  centerName: string | null;
  Registration: number;
  Submission: number;
  CreativeMinds: number;
  Nomination: number;
  RunnerUp: number;
  Winner: number;
  total_center_points: number;
}

@Injectable()
export class CentreWallService {
  private readonly logger = new Logger(CentreWallService.name);
  constructor(
    @InjectRepository(CentreWall)
    private readonly CentreWallRepo: Repository<CentreWall>,

    private readonly fileUploadService: FileUploadService,

    @InjectRepository(EventSubmission)
    private readonly submissionRepo: Repository<EventSubmission>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Event)
    private readonly eventRepo: Repository<Event>,

    @InjectRepository(EventUser)
    private readonly eventUserRepo: Repository<EventUser>,

    @InjectRepository(EventCourseCategory)
    private eventCourseCategoryRepository: Repository<EventCourseCategory>,

    @InjectRepository(UserMetaData)
    private readonly usermetaData: Repository<UserMetaData>,

    @InjectRepository(EventRating)
    private readonly eventRatingRepo: Repository<EventRating>,

    @InjectRepository(EventWinner)
    private readonly eventWinnerRepo: Repository<EventWinner>,

    @InjectRepository(EventPoint)
    private readonly eventpointrepo: Repository<EventPoint>,

    @InjectRepository(Centre)
    private readonly centreRepo: Repository<Centre>,
  ) {}

  async create(dto: CreateCentreWallDto): Promise<any> {
    try {
      const event = await this.eventRepo.findOne({ where: { id: dto.eventId } });
      if (!event) {
        throw new NotFoundException(`Event with id ${dto.eventId} not found`);
      }

      const uniqueId = Date.now().toString();
      let centerLogoKey = '';
      let centerLogoUrl = '';

      if (dto.centerLogo) {
        const ext = dto.centerLogo.split('.').pop();
        centerLogoKey = `S3_CENTER_LOGO/${uniqueId}/logo.${ext}`;
        ({ url: centerLogoUrl } =
          await this.fileUploadService.generatePutObjectPresignedUrl(centerLogoKey));
      }

      const centerMediaKeys: string[] = [];
      const mediaUploadUrls: string[] = [];

      if (Array.isArray(dto.centerMedia)) {
        for (const [index, filename] of dto.centerMedia.entries()) {
          const ext = filename.split('.').pop();
          const key = `S3_CENTRE_MEDIA/${uniqueId}/media_${index}.${ext}`;
          const { url } = await this.fileUploadService.generatePutObjectPresignedUrl(key);
          centerMediaKeys.push(key);
          mediaUploadUrls.push(url);
        }
      }

      let existingWall = await this.CentreWallRepo.findOne({
        where: {
          centerId: dto.centerId,
          eventId: { id: dto.eventId },
        },
        relations: ['eventId'],
      });

      if (existingWall) {
        existingWall.centerLogo = centerLogoKey || existingWall.centerLogo;
        existingWall.centerMedia = centerMediaKeys.length
          ? centerMediaKeys
          : existingWall.centerMedia;
        existingWall.cheerChant = dto.cheerChant ?? existingWall.cheerChant;

        const updatedWall = await this.CentreWallRepo.save(existingWall);

        return {
          centreWall: {
            ...updatedWall,
            centerLogo: centerLogoUrl || updatedWall.centerLogo,
            centerMedia: mediaUploadUrls.length
              ? mediaUploadUrls
              : updatedWall.centerMedia,
            eventId: { id: dto.eventId },
          },
          message: 'CentreWall updated successfully',
        };
      }

      const newWall = this.CentreWallRepo.create({
        centerId: dto.centerId,
        centerLogo: centerLogoKey,
        cheerChant: dto.cheerChant,
        centerMedia: centerMediaKeys,
        eventId: { id: dto.eventId },
      });

      const savedWall = await this.CentreWallRepo.save(newWall);

      return {
        centreWall: {
          ...savedWall,
          centerLogo: centerLogoUrl,
          centerMedia: mediaUploadUrls,
        },
        message: 'CentreWall created successfully',
      };
    } catch (error) {
      console.error('Error while creating/updating CentreWall:', error);
      throw error;
    }
  }

  async getCentreWall(centerId: number, eventId: number): Promise<any> {
    try {
      console.log(`Fetching CentreWall with centerId: ${centerId}, eventId: ${eventId}`);

      const wall = await this.CentreWallRepo.findOne({
        where: {
          centerId,
          eventId: { id: eventId },
        },
        relations: ['eventId'],
      });

      if (!wall) {
        throw new NotFoundException(
          `No CentreWall found for centerId ${centerId} and eventId ${eventId}`,
        );
      }

      const extensionTypeMap: Record<string, string> = {
        '.jpg': 'image',
        '.jpeg': 'image',
        '.png': 'image',
        '.gif': 'image',
        '.webp': 'image',
        '.mp4': 'video',
        '.mov': 'video',
        '.avi': 'video',
        '.mkv': 'video',
        '.webm': 'video',
      };

      const mediaPresignedUrls = await Promise.all(
        (wall.centerMedia || []).map(async (key) => {
          const url = await this.fileUploadService.generateGetObjectPresignedUrl(key);
          const ext = path.extname(key).toLowerCase();
          const type = extensionTypeMap[ext] || 'other';
          return { type, url };
        }),
      );

      let logoPresignedUrl = '';
      if (wall.centerLogo) {
        logoPresignedUrl = await this.fileUploadService.generateGetObjectPresignedUrl(
          wall.centerLogo,
        );
      }

      return {
        centerId: wall.centerId,
        centerLogo: logoPresignedUrl,
        centerMedia: mediaPresignedUrls,
        cheerChant: wall.cheerChant,
        eventId: eventId,
      };
    } catch (error) {
      console.error('Error in getCentreWall:', error);
      throw new NotFoundException('Failed to fetch CentreWall');
    }
  }

  async getCenterDashboard(
    centerId: number,
    eventId: number,
    queryParams: QueryParamsDto & { filter?: CenterDashboardFilterDto },
  ): Promise<any> {
    try {
      const { page = 1, limit = 10, filter } = queryParams;

      const eventUsers = await this.eventUserRepo.find({
        where: { centerId: centerId, eventId: eventId },
      });
      const eventUserIds = eventUsers.map((user) => user.userId);

      const users = await this.userRepo.find({
        where: { userId: In(eventUserIds) },
      });

      const submissions = await this.submissionRepo.find({
        where: { centreId: centerId, eventId },
      });
      const submittedUserIds = submissions.map((sub) => sub.studentId);

      const studentList = [];
      for (const eu of eventUsers) {
        const eventCategories = await this.eventCourseCategoryRepository.find({
          where: { courseCode: eu.courseCode },
        });
        for (const usr of users) {
          if (usr.userId == eu.userId) {
            studentList.push({
              studentId: eu.userId,
              studentName: usr.name || null,
              eventCategory: eventCategories[0].categoryName || null,
              submissionStatus: submittedUserIds.includes(eu.userId)
                ? SubmissionStatus.SUBMITTED
                : 'not-submitted',
            });
          }
        }
      }

      let filtered = studentList;

      if (filter?.category) {
        filtered = filtered.filter((s) =>
          s.eventCategory?.toLowerCase().includes(filter.category.toLowerCase()),
        );
      }

      if (filter?.submissionStatus) {
        filtered = filtered.filter((s) => s.submissionStatus === filter.submissionStatus);
      }

      const totalCount = filtered.length;
      const startIndex = (page - 1) * limit;
      const paginated = filtered.slice(startIndex, startIndex + limit);

      const submittedCount = filtered.filter(
        (s) => s.submissionStatus === SubmissionStatus.SUBMITTED,
      ).length;

      const rejectedCount = filtered.filter(
        (s) => s.submissionStatus === SubmissionStatus.REJECTED,
      ).length;

      const nextPage = limit !== -1 ? totalCount > startIndex + limit : false;

      return {
        submitted: submittedCount,
        rejected: rejectedCount,
        totalCount,
        studentList: paginated,
        page,
        limit,
        nextPage,
      };
    } catch (error) {
      console.error('Error in getCenterDashboard:', error);
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to fetch submission status data');
    }
  }

  async updateCentreWall(dto: UpdateCentreWallDto): Promise<any> {
    try {
      const wall = await this.CentreWallRepo.findOne({
        where: {
          centerId: dto.centerId,
          eventId: { id: dto.eventId },
        },
      });

      if (!wall) {
        throw new NotFoundException(
          `CenterWall not found for event ${dto.eventId} and center ${dto.centerId}`,
        );
      }

      let centerLogoKey = wall.centerLogo;
      let centerLogoUrl = '';

      if (dto.centerLogo) {
        const ext = dto.centerLogo.split('.').pop();
        centerLogoKey = `S3_CENTRE_LOGO/${Date.now()}/logo.${ext}`;
        ({ url: centerLogoUrl } =
          await this.fileUploadService.generatePutObjectPresignedUrl(centerLogoKey));
      }

      const centerMediaKeys: string[] = [];
      const mediaUploadUrls: string[] = [];

      if (Array.isArray(dto.centerMedia)) {
        for (const [index, filename] of dto.centerMedia.entries()) {
          const ext = filename.split('.').pop();
          const key = `S3_CENTRE_MEDIA/${Date.now()}/media_${index}.${ext}`;
          const { url } = await this.fileUploadService.generatePutObjectPresignedUrl(key);
          centerMediaKeys.push(key);
          mediaUploadUrls.push(url);
        }
      }

      wall.centerLogo = centerLogoKey || wall.centerLogo;
      wall.cheerChant = dto.cheerChant ?? wall.cheerChant;
      wall.centerMedia = centerMediaKeys.length > 0 ? centerMediaKeys : wall.centerMedia;

      const updatedWall = await this.CentreWallRepo.save(wall);

      return {
        centreWall: {
          ...updatedWall,
          centerLogo: centerLogoUrl || wall.centerLogo,
          centerMedia: mediaUploadUrls.length > 0 ? mediaUploadUrls : wall.centerMedia,
        },
      };
    } catch (error) {
      console.error('Error while updating CentreWall:', error);
      throw error;
    }
  }

  async CenterPoints(centerIds?: any[], eventId?: number): Promise<any> {
    if (!centerIds) {
      throw new Error('CenterId must be provided');
    }

    const eventUserData = await this.eventUserRepo.findBy({ centerId: In(centerIds) });

    const submissions = await this.submissionRepo.find({
      where: {
        centreId: In(centerIds),
        eventId: eventId,
        submissionStatus: In([SubmissionStatus.SUBMITTED, SubmissionStatus.REJECTED]),
      },
    });

    const ratings = await this.eventRatingRepo
      .createQueryBuilder('er')
      .leftJoinAndSelect('er.submission', 's')
      .where('s.centreId IN (:...centerIds)', { centerIds })
      .andWhere('er.eventId = :eventId', { eventId })
      .andWhere('er.juryRole = :juryRole', { juryRole: JuryRole.INTERNAL })
      .andWhere('er.status = :status', { status: RatingStatus.PUBLISH })
      .getMany();

    const winners = await this.eventWinnerRepo
      .createQueryBuilder('ew')
      .leftJoinAndSelect('ew.submission', 's')
      .where('s.centreId IN (:...centerIds)', { centerIds })
      .andWhere('ew.eventId = :eventId', { eventId })
      .getMany();

    const now = new Date();

    for (const id of centerIds) {
      const registrationCount = eventUserData.filter(
        (u) => u.centerId === id && u.eventId === eventId,
      ).length;
      const registrationPoints = registrationCount * 5;

      const submissionCount = submissions.filter(
        (s) => s.centreId === id && s.eventId === eventId,
      ).length;
      const submissionPoints = submissionCount * 15;

      const creativeMindsPoints = 0;

      const nominationCount = ratings.filter(
        (r) =>
          r.eventId === eventId &&
          r.submission.centreId === id &&
          r.juryRole === JuryRole.INTERNAL &&
          r.status == RatingStatus.PUBLISH,
      ).length;
      const nominationPoints = nominationCount * 150;

      const runnerUpCount = winners.filter(
        (w) => w.eventId === eventId && w.runnerUp && w.submission.centreId === id,
      ).length;
      const runnerUpPoints = runnerUpCount * 250;

      const winnerCount = winners.filter(
        (w) => w.eventId === eventId && w.winner && w.submission.centreId === id,
      ).length;
      const winnerPoints = winnerCount * 500;

      await this.eventpointrepo.upsert(
        {
          centerId: id,
          eventId: eventId,
          points: {
            registration: registrationPoints,
            submission: submissionPoints,
            creativeMinds: creativeMindsPoints,
            nomination: nominationPoints,
            runnerUp: runnerUpPoints,
            winner: winnerPoints,
          },
          updated: now,
          created: now,
        },
        ['centerId', 'eventId'],
      );
    }
  }

  async sortByKey(arr, key, ascending = true) {
    return arr.sort((a, b) => {
      if (a[key] < b[key]) return ascending ? -1 : 1;
      if (a[key] > b[key]) return ascending ? 1 : -1;
      return 0;
    });
  }

  async GetCenterPointsFromTable(
    centerId?: number,
    eventId?: number,
    queryParams?: QueryParamsDto & { sortBy?: string },
  ): Promise<any> {
    if (!eventId) {
      throw new Error('Either centerId or eventId must be provided');
    }

    const eventPointsData = await this.eventpointrepo.find({
      where: { eventId },
    });

    const centerPointsData = await this.eventpointrepo.find({
      where: { eventId, centerId },
    });

    if (!eventPointsData.length) {
      return { total: 0, page: 1, limit: 10, LeadingCenters: [], CenterWisePoints: [] };
    }

    const centerIds = [...new Set(eventPointsData.map((ep) => ep.centerId))];
    const centersData = await this.centreRepo.find({
      where: { centreKey: In(centerIds) },
      select: ['centreKey', 'name'],
    });
    const centerMap = new Map(centersData.map((c) => [Number(c.centreKey), c.name]));

    const centersWallData = await this.CentreWallRepo.find({
      where: { centerId: In(centerIds) },
      select: ['centerId', 'centerLogo'],
    });

    const centersLogoMap = new Map(
      centersWallData.map((c) => [Number(c.centerId), c.centerLogo]),
    );

    for (const centerWall of centersLogoMap) {
      const logoPresignedUrl = await this.fileUploadService.generateGetObjectPresignedUrl(
        centerWall[1],
      );
      centersLogoMap.set(centerWall[0], logoPresignedUrl);
    }

    let results = eventPointsData.map((ep) => ({
      centerId: ep.centerId,
      eventId: ep.eventId,
      centerName: centerMap.get(ep.centerId) || null,
      centerLogo: centersLogoMap.get(ep.centerId) || null,
      Registration: ep.points.registration || 0,
      Submission: ep.points.submission || 0,
      CreativeMinds: ep.points.creativeMinds || 0,
      Nomination: ep.points.nomination || 0,
      RunnerUp: ep.points.runnerUp || 0,
      Winner: ep.points.winner || 0,
      total_center_points:
        (ep.points.registration || 0) +
        (ep.points.submission || 0) +
        (ep.points.creativeMinds || 0) +
        (ep.points.nomination || 0) +
        (ep.points.runnerUp || 0) +
        (ep.points.winner || 0),
    }));

    const { page = 1, limit = 10, sortBy } = queryParams || {};
    const skip = (page - 1) * limit;

    // sort result by center points for ranking
    let sortedByresults = await this.sortByKey(results, 'total_center_points', false);
    sortedByresults = sortedByresults.map((item, index) => ({
      ...item,
      rank: index + 1,
    }));

    // your center rank
    let CurrentCenterData: CenterPointsView[];
    if (!centerPointsData) {
      console.log('Center data not published yet!');
    } else {
      CurrentCenterData = sortedByresults.filter((cs) => cs.centerId == centerId);
    }

    results = sortedByresults.slice(3, results.length);

    return {
      total: sortedByresults.length,
      page,
      limit,
      LeadingCenters: sortedByresults.slice(0, 3),
      CenterWisePoints: results.slice(skip, skip + limit),
      CurrentCenterData: CurrentCenterData,
    };
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async runCenterPointsCron(): Promise<void> {
    this.logger.log(`Running CenterPoints cron job... ${new Date()}`);

    try {
      const events = await this.eventRepo.findBy({ eventStatus: EventStatus.ACTIVE });
      for (const event of events) {
        const eventId = event.id;

        const centerIds = (
          await this.eventUserRepo
            .createQueryBuilder('eventUser')
            .select('DISTINCT "centerId"', 'centerId')
            .where('eventUser.eventId = :eventId', { eventId })
            .getRawMany()
        ).map((row) => Number(row.centerId));

        try {
          await this.CenterPoints(centerIds, eventId);
        } catch (err) {
          this.logger.error(`Error inserting center points: ${err.message}`);
        }
      }
    } catch (err) {
      this.logger.error(' Cron failed to run:', err.message);
    }
  }
}
