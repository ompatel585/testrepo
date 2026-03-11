import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Event, EventStatus } from 'src/common/entities/event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { FileUploadService } from 'src/file-upload/file-upload.service';
import { UserMetaData } from 'src/common/entities/user-metadata.entity';
import { isStudentMetaData } from 'src/common/types/guard';
import { EventCourseCategory } from 'src/common/entities/eventCourseCategories.entity';
import { EventSubmission } from 'src/common/entities/eventSubmission.entity';
import { UpdateEventDto } from './dto/update-event.dto';
import { User } from 'src/common/entities/user.entity';

@Injectable()
export class EventService {
  private readonly logger = new Logger(EventService.name);

  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    private readonly fileUploadService: FileUploadService,

    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(UserMetaData)
    private userMetaDataRepository: Repository<UserMetaData>,

    @InjectRepository(EventCourseCategory)
    private eventCourseCategoryRepository: Repository<EventCourseCategory>,

    @InjectRepository(EventSubmission)
    private eventSubmissionRepository: Repository<EventSubmission>,
  ) {}

  async createEvent(dto: CreateEventDto) {
    const { assets } = dto;
    const uniqueId = Date.now().toString();
    const urls: Record<string, string> = {};
    const eventData: CreateEventDto = {
      ...dto,
      assets: {
        bannerPath: '',
        ruleBookPath: '',
        evaluationCriteriaPath: '',
      },
    };

    if (assets?.bannerPath) {
      const bannerKey = `S3_BANNER/${uniqueId}/${uniqueId}.jpg`;
      const { url } =
        await this.fileUploadService.generatePutObjectPresignedUrl(bannerKey);
      urls.banner = url;
      eventData.assets.bannerPath = bannerKey;
    }

    if (assets?.ruleBookPath) {
      const rulebookKey = `S3_BOOK/${uniqueId}/${uniqueId}.pdf`;
      const { url } =
        await this.fileUploadService.generatePutObjectPresignedUrl(rulebookKey);
      urls.rulebook = url;
      eventData.assets.ruleBookPath = rulebookKey;
    }

    if (assets?.evaluationCriteriaPath) {
      const evaluationKey = `S3_BOOK/${uniqueId}/${uniqueId}.pptx`;
      const { url } =
        await this.fileUploadService.generatePutObjectPresignedUrl(evaluationKey);
      urls.evaluation = url;
      eventData.assets.evaluationCriteriaPath = evaluationKey;
    }

    const event = this.eventRepository.create(eventData);
    await this.eventRepository.save(event);

    return {
      assets: {
        banner: urls.banner,
        rulebook: urls.rulebook,
        evaluation: urls.evaluation,
      },
    };
  }

  async getEventCategoriesByBrandId(id: number) {
    const [items, total] = await this.eventCourseCategoryRepository.findAndCount({
      where: { brand: { id } },
      select: ['id', 'categoryName', 'courseCode', 'allowedType', 'brand'],
    });

    return { items, total };
  }

  async getEvents() {
    const bucketName = process.env.S3_BUCKET_NAME;
    const s3BaseUrl = `https://${bucketName}.s3.amazonaws.com/`;
    const events = await this.eventRepository.find({
      where: { eventStatus: EventStatus.ACTIVE },
    });

    const formattedEvents = [];

    for (const event of events) {
      const domesticIds = event.categories?.domestic || [];
      const internationalIds = event.categories?.international || [];

      const allCategoryIds = [...domesticIds, ...internationalIds];

      const categoryEntities =
        await this.eventCourseCategoryRepository.findByIds(allCategoryIds);

      const categoryMap = new Map(
        categoryEntities.map((cat) => [
          cat.id,
          { categoryId: cat.id, categoryName: cat.categoryName },
        ]),
      );

      const domesticCategories = domesticIds
        .map((id) => categoryMap.get(id))
        .filter(Boolean);
      const internationalCategories = internationalIds
        .map((id) => categoryMap.get(id))
        .filter(Boolean);

      const bannerPresignedGETUrl =
        await this.fileUploadService.generateGetObjectPresignedUrl(
          event.assets?.bannerPath,
        );
      const ruleBookPresignedGETUrl =
        await this.fileUploadService.generateGetObjectPresignedUrl(
          event.assets?.ruleBookPath,
        );
      const evaluationCriteriaPresignedGETUrl =
        await this.fileUploadService.generateGetObjectPresignedUrl(
          event.assets?.evaluationCriteriaPath,
        );

      formattedEvents.push({
        brand: event.brand?.id,
        id: event.id,
        eventName: event.eventName,
        startDate: event.startDate,
        endDate: event.endDate,
        description: event.description,
        guidelines: event.guidelines,
        assets: {
          bannerUrl: bannerPresignedGETUrl,
          ruleBookUrl: ruleBookPresignedGETUrl,
          evaluationCriteriaUrl: evaluationCriteriaPresignedGETUrl,
        },
        categories: {
          domestic: domesticCategories,
          international: internationalCategories,
        },
      });
    }

    return formattedEvents;
  }

  async getEventById(user: any, eventId: number) {
    const bucketName = process.env.S3_BUCKET_NAME;
    const s3BaseUrl = `https://${bucketName}.s3.amazonaws.com/`;

    const event = await this.eventRepository.findOne({
      where: { id: eventId, eventStatus: EventStatus.ACTIVE },
    });

    if (!event) {
      throw new NotFoundException('Event not found for the provided brand.');
    }

    const userData = await this.userRepository.findOneBy({ id: user.id });

    const userMetaData = await this.userMetaDataRepository.findOneBy({ userId: user.id });

    const bannerPresignedGETUrl =
      await this.fileUploadService.generateGetObjectPresignedUrl(
        event.assets?.bannerPath,
      );

    const ruleBookPresignedGETUrl =
      await this.fileUploadService.generateGetObjectPresignedUrl(
        event.assets?.ruleBookPath,
      );

    const evaluationCriteriaPresignedGETUrl =
      await this.fileUploadService.generateGetObjectPresignedUrl(
        event.assets?.evaluationCriteriaPath,
      );

    if (!userMetaData?.metaData || !isStudentMetaData(userMetaData.metaData)) {
      console.warn(`Invalid or missing metadata for userId: ${user.id}`);
      return {
        id: event.id,
        eventName: event.eventName,
        eventDescription: event.description,
        startDate: event.startDate,
        endDate: event.endDate,
        brand: event?.brand?.id,
        guidelines: event.guidelines,
        assets: {
          bannerUrl: bannerPresignedGETUrl,
          ruleBookUrl: ruleBookPresignedGETUrl,
          evaluationCriteriaUrl: evaluationCriteriaPresignedGETUrl,
        },
        categories: [],
      };
    }

    const userCourseCodes = userMetaData.metaData.BC.flatMap((bc) =>
      bc.Courses.map((c) => c.CourseCode),
    );

    let allowedDom = [];
    let allowedInt = [];
    if (userData.isDomestic) {
      allowedDom = event.categories?.domestic || [];
    } else {
      allowedInt = event.categories?.international || [];
    }
    const categoryIds = [...allowedDom, ...allowedInt];

    if (categoryIds.length === 0) {
      return {
        id: event.id,
        eventName: event.eventName,
        eventDescription: event.description,
        startDate: event.startDate,
        endDate: event.endDate,
        brand: event?.brand?.id,
        guidelines: event.guidelines,
        assets: {
          bannerUrl: bannerPresignedGETUrl,
          ruleBookUrl: ruleBookPresignedGETUrl,
          evaluationCriteriaUrl: evaluationCriteriaPresignedGETUrl,
        },
        categories: [],
      };
    }

    const submissions = await this.eventSubmissionRepository
      .createQueryBuilder('submission')
      .distinctOn(['submission.categoryId'])
      .where('submission.eventId = :eventId', { eventId: event.id })
      .andWhere('submission.studentId = :studentId', { studentId: user.userId })
      .andWhere('submission.courseCode IN (:...courseCodes)', {
        courseCodes: userCourseCodes,
      })
      .orderBy('submission.categoryId', 'ASC')
      .addOrderBy('submission.id', 'DESC')
      .getMany();

    const categorySubmissions = submissions.filter((submission) =>
      categoryIds.includes(Number(submission.categoryId)),
    );

    const categoryDataList = await this.eventCourseCategoryRepository.findBy({
      id: In(categoryIds),
    });

    const validCategoryDataList = categoryDataList.filter((cat) =>
      userCourseCodes.includes(cat.courseCode),
    );

    const categoryDataMap = new Map(validCategoryDataList.map((cat) => [cat.id, cat]));

    const response = {
      id: event.id,
      eventName: event.eventName,
      eventDescription: event.description,
      startDate: event.startDate,
      endDate: event.endDate,
      brand: event?.brand?.id,
      guidelines: event.guidelines,
      wildCard: event?.wildCard,
      categoryConfig: event?.categoryConfig,
      assets: {
        bannerUrl: bannerPresignedGETUrl,
        ruleBookUrl: ruleBookPresignedGETUrl,
        evaluationCriteriaUrl: evaluationCriteriaPresignedGETUrl,
      },
      categories: await Promise.all(
        [...categoryDataMap.keys()].map(async (categoryId) => {
          const categoryData = categoryDataMap.get(categoryId);
          const submissionsForCategory = categorySubmissions.filter(
            (s) => Number(s.categoryId) === categoryId,
          );

          let thumbnailURL = String || '';
          let submissionStatus = String || '';
          if (submissionsForCategory.length > 0) {
            thumbnailURL = await this.fileUploadService.generateGetObjectPresignedUrl(
              submissionsForCategory[0].thumbnail,
            );
            submissionStatus = submissionsForCategory[0].submissionStatus;
          }

          return {
            categoryId,
            categoryName: categoryData.categoryName,
            courseCode: categoryData.courseCode,
            allowedType: categoryData.allowedType || [],
            thumbnail: thumbnailURL,
            submissionStatus: submissionStatus,
            submission: await Promise.all(
              submissionsForCategory.map(async (s) => {
                for (const artwork of s.artworks) {
                  const url = await this.fileUploadService.generateGetObjectPresignedUrl(
                    artwork.artworkUrl,
                  );

                  return {
                    fileType: artwork.fileType,
                    artworkUrl: url ? url : artwork.artworkUrl,
                    externalUrl: artwork.externalUrl,
                  };
                }
              }),
            ),
          };
        }),
      ),
    };

    return response;
  }
  async softDeleteEvent(eventId: number): Promise<void> {
    const event = await this.eventRepository.findOne({ where: { id: eventId } });

    if (!event) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }

    event.eventStatus = EventStatus.INACTIVE;
    await this.eventRepository.save(event);
  }

  async updateEvent(id: number, dto: UpdateEventDto) {
    const existingEvent = await this.eventRepository.findOne({ where: { id } });

    if (!existingEvent) {
      throw new NotFoundException('Event not found');
    }

    const { assets } = dto;
    const urls: Record<string, string> = {};
    const uniqueId = Date.now().toString();

    if (assets?.bannerPath) {
      const bannerKey = `S3_BANNER/${uniqueId}/${uniqueId}.jpg`;
      const { url } =
        await this.fileUploadService.generatePutObjectPresignedUrl(bannerKey);
      urls.banner = url;
      existingEvent.assets.bannerPath = bannerKey;
    }

    if (assets?.ruleBookPath) {
      const rulebookKey = `S3_BOOK/${uniqueId}/${uniqueId}.pdf`;
      const { url } =
        await this.fileUploadService.generatePutObjectPresignedUrl(rulebookKey);
      urls.rulebook = url;
      existingEvent.assets.ruleBookPath = rulebookKey;
    }

    if (assets?.evaluationCriteriaPath) {
      const evaluationKey = `S3_BOOK/${uniqueId}/${uniqueId}.pptx`;
      const { url } =
        await this.fileUploadService.generatePutObjectPresignedUrl(evaluationKey);
      urls.evaluation = url;
      existingEvent.assets.evaluationCriteriaPath = evaluationKey;
    }

    Object.assign(existingEvent, {
      ...dto,
      assets: existingEvent.assets,
    });

    await this.eventRepository.save(existingEvent);

    return {
      message: 'Event updated successfully',
      updatedEvent: existingEvent,
    };
  }
}
