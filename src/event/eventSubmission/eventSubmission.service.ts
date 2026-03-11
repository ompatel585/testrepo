import {
  Injectable,
  HttpException,
  HttpStatus,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  EventSubmission,
  SubmissionStatus,
} from 'src/common/entities/eventSubmission.entity';
import { ArtworkDto, CreateSubmissionDto } from '../dto/create-event-submission.dto';
import * as path from 'path';
import { EventCourseCategory } from 'src/common/entities/eventCourseCategories.entity';
import { FileUploadService } from 'src/file-upload/file-upload.service';
import { CreateProfessionalSubmissionDto } from '../dto/create-event-submission-professional.dto';
import { OtpService } from 'src/otp/otp.service';
import { Organization } from 'src/common/entities/origanization.entity';
import * as bcrypt from 'bcrypt';
import * as constant from '../../common/constants';
import { User } from 'src/common/entities/user.entity';
import { Role } from 'src/common/enum/role.enum';
import { WCELStudentSubmissionOtpEmailTemplate } from 'src/email/templates/otp-email.template';
import { EmailService } from 'src/email/email.service';
import { Event } from 'src/common/entities/event.entity';
import {
  EventAssignToRate,
  RatingStatusEnum,
} from 'src/common/entities/eventAssignRole.entity';
import { CreateEventRatingDto } from '../dto/create-event-rating.dto';
import {
  EventRating,
  JuryRole,
  RatingStatus,
} from 'src/common/entities/eventRating.entity';
import { UpdateSubmissionStatusDto } from '../dto/update-submission-status.dto';
import { AssignSubmissionDto } from '../dto/assign-submission.dto';
const logger = new Logger('SubmissionService');
import { FilterEventRatingDto } from '../dto/filter-event-rating.dto';
import { QueryParamsDto } from 'src/common/dto/query-params.dto';
import { UpdateEventRatingDto } from '../dto/update-event-rating.dto';
import { EventJury } from 'src/common/entities/eventJury.entity';
import { EventWinner } from 'src/common/entities/event-winner.entity';
import { error } from 'console';
import { Centre } from 'src/common/entities/centre.entity';

const eventName = 'WCEL';
@Injectable()
export class SubmissionService {
  logger: any;
  constructor(
    private emailService: EmailService,
    private otpService: OtpService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
    @InjectRepository(EventSubmission)
    private readonly submissionRepo: Repository<EventSubmission>,
    private readonly fileUploadService: FileUploadService,
    @InjectRepository(EventCourseCategory)
    private readonly eventCategoryRepository: Repository<EventCourseCategory>,
    @InjectRepository(Centre)
    private readonly centerRepository: Repository<Centre>,
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    @InjectRepository(EventJury)
    private readonly eventJury: Repository<EventJury>,
    @InjectRepository(EventAssignToRate)
    private readonly eventassigntorateRepo: Repository<EventAssignToRate>,

    @InjectRepository(EventRating)
    private readonly eventRatingRepo: Repository<EventRating>,
    @InjectRepository(EventWinner)
    private readonly eventWinnerRepo: Repository<EventWinner>,
  ) {}

  async create(dto: CreateSubmissionDto) {
    const eventCategory = await this.eventCategoryRepository.findOne({
      where: { courseCode: dto.courseCode },
    });

    if (!eventCategory) {
      throw new HttpException(
        {
          data: null,
          success: false,
          message: `Invalid course code: ${dto.courseCode}`,
          statusCode: 400,
          errors: [`Course code ${dto.courseCode} does not exist.`],
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    // validate uploaded file type allowed or not
    const notAllowed = [];
    let genPreSignedUrl: ArtworkDto[] = [];
    let artworkSave: ArtworkDto[] = [];
    for (const artwork of dto.artworks) {
      if (!eventCategory.allowedType.includes(artwork.fileType)) {
        notAllowed.push(artwork.fileType);
      }
    }

    if (notAllowed.length > 0) {
      throw new HttpException(
        {
          data: null,
          success: false,
          message: `Submitted invalid file type: ${notAllowed}`,
          statusCode: 400,
          errors: [
            `Selected ${notAllowed} filetype not allowed in ${eventCategory.categoryName}.`,
          ],
        },
        HttpStatus.BAD_REQUEST,
      );
    } else {
      // verify existing submission
      const existingSubmission = await this.submissionRepo.findOne({
        where: {
          categoryId: dto.categoryId,
          courseCode: dto.courseCode,
          studentId: dto.studentId,
          studentEmail: dto.studentEmail,
          centreId: dto.centreId,
          eventId: dto.eventId,
          submissionStatus: SubmissionStatus.DRAFT,
        },
      });

      // if submission with draft status found remove it & submit again
      if (existingSubmission) {
        await this.submissionRepo.remove(existingSubmission);
      }

      // generate pre-signed url for uploads
      for (const artwork of dto.artworks) {
        const timestamp = Date.now();
        const fileExtension = path.extname(artwork.artworkUrl);
        const s3Key = `EVENTS/${dto.eventId}/student/${dto.studentId}/${timestamp}${fileExtension}`;

        const { url } = await this.fileUploadService.generatePutObjectPresignedUrl(s3Key);

        // return response
        genPreSignedUrl.push({
          fileType: artwork.fileType,
          artworkUrl: url,
          externalUrl: artwork.externalUrl,
        });

        // save into db
        artworkSave.push({
          fileType: artwork.fileType,
          artworkUrl: s3Key,
          externalUrl: artwork.externalUrl,
        });
      }
    }

    const timestamp = Date.now();
    const fileExtension = path.extname(dto.thumbnailUrl);
    const thumbanilKey = `EVENTS/${dto.eventId}/student/${dto.studentId}/${timestamp}_thumbnail${fileExtension}`;

    const { url } =
      await this.fileUploadService.generatePutObjectPresignedUrl(thumbanilKey);
    const thumbnailUrl = url;

    // Save submission
    const submission = this.submissionRepo.create({
      categoryId: dto.categoryId,
      courseCode: dto.courseCode,
      studentId: dto.studentId,
      studentEmail: dto.studentEmail,
      centreId: dto.centreId,
      eventId: dto.eventId,
      artworks: artworkSave,
      thumbnail: thumbanilKey,
      submissionStatus: SubmissionStatus.DRAFT,
    });
    const saved = await this.submissionRepo.save(submission);

    if (saved) {
      // Send submission email
      const msg = {
        to: dto.studentEmail,
        from: constant.FROM_EMAIL_ID,
        subject: 'WCEL Artwork Successful Submission!',
        html: WCELStudentSubmissionOtpEmailTemplate(
          eventCategory.categoryName,
          eventName,
        ),
      };
      await this.emailService.sendEmail(msg);
    }

    // return response
    return {
      submissionId: saved.id,
      file: genPreSignedUrl,
      thumbnail: thumbnailUrl,
    };
  }

  async createProfessional(dto: CreateProfessionalSubmissionDto) {
    if (dto.emailToken) {
      await this.otpService.verifyEmailOtp(dto.emailOtp, dto.userEmail, dto.emailToken);
    }

    const course = await this.eventCategoryRepository.findOne({
      where: { courseCode: dto.courseCode },
    });

    if (!course) {
      throw new HttpException(
        {
          data: null,
          success: false,
          message: `Invalid course code: ${dto.courseCode}`,
          statusCode: 400,
          errors: [`Course code ${dto.courseCode} does not exist.`],
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const timestamp = Date.now();
    const fileExtension = path.extname(dto.filePath);
    const emailParts = dto.userEmail.split('@');
    const s3Key = `EVENTS/${dto.eventId}/non-student/${emailParts[0]}/${timestamp}${fileExtension}`;
    const { url } = await this.fileUploadService.generatePutObjectPresignedUrl(s3Key);

    const submission = this.submissionRepo.create({
      categoryId: dto.categoryId,
      courseCode: dto.courseCode,
      studentId: dto.userId,
      studentEmail: dto.userEmail,
      centreId: 1,
      eventId: dto.eventId,
      artworks: [
        {
          fileType: dto.fileType,
          artworkUrl: dto.filePath,
          externalUrl: '',
        },
      ],
    });

    const saved = await this.submissionRepo.save(submission);

    const existingUser = await this.userRepository.findOneBy({
      email: dto.userEmail,
    });
    if (!existingUser) {
      const hashedPassword = await bcrypt.hash('password', constant.SALT_ROUNDS);
      const organization = this.organizationRepository.create({ id: 1 });
      const user = this.userRepository.create({
        userId: dto.userId,
        name: dto.userName,
        email: dto.userEmail,
        // centreName: dto.university,
        // brandId: dto.brandId,
        // organization,
        // role: Role.Guest,
        // roles: [Role.Guest],
        // password: hashedPassword,
        // centreId: 1,
      });
      await this.userRepository.save(user);
    }

    // Send submission email
    const msg = {
      to: dto.userEmail,
      from: constant.FROM_EMAIL_ID,
      subject: 'WCEL Artwork Successful Submission!',
      html: WCELStudentSubmissionOtpEmailTemplate(course.categoryName, eventName),
    };
    await this.emailService.sendEmail(msg);

    return {
      submissionId: saved.id,
      file: url,
    };
  }

  async updateSubmissionStatus(dto: UpdateSubmissionStatusDto) {
    const { submissionId, status } = dto;

    const submission = await this.submissionRepo.findOne({
      where: { id: submissionId },
    });

    if (!submission) {
      throw new NotFoundException(`Submission with ID ${submissionId} not found`);
    }

    submission.submissionStatus = status.toLocaleLowerCase() as SubmissionStatus;
    const updated = await this.submissionRepo.save(submission);

    return {
      message: `Submission status updated to ${status}`,
      data: updated,
    };
  }

  async getCategoryWiseSubmissions(eventId: number, juryId: string) {
    const event = await this.eventRepository.findOne({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }

    const eventName = event.eventName;
    const courseCategories = await this.eventCategoryRepository.find({
      where: { brand: { id: event.brandId } },
    });

    const allAssignments = await this.eventassigntorateRepo.find({
      where: { eventId, juryId },
    });

    const totalEntryMap: Record<number, number> = {};
    const pendingEntryMap: Record<number, number> = {};

    for (const assign of allAssignments) {
      const categoryId = assign.categoryId;

      totalEntryMap[categoryId] = (totalEntryMap[categoryId] || 0) + 1;

      if (assign.ratingStatus === RatingStatusEnum.NOT_RATED) {
        pendingEntryMap[categoryId] = (pendingEntryMap[categoryId] || 0) + 1;
      }
    }

    const categories = courseCategories.map((category) => ({
      categoryId: category.id,
      categoryName: category.categoryName,
      totalEntry: totalEntryMap[category.id] || 0,
      pendingEntry: pendingEntryMap[category.id] || 0,
    }));

    return {
      eventId,
      eventName,
      totalSubmissions: allAssignments.length,
      totalCategories: categories.length,
      categories,
    };
  }

  async getFilteredSubmissions({
    page = 1,
    count = 20,
    rating,
    buckets,
    categoryId,
    eventId,
    user,
    status,
  }: {
    page: number;
    count: number;
    rating: number[];
    buckets: 'rated' | 'nonrated' | 'wishlist' | 'zap' | '' | null;
    categoryId?: number;
    eventId?: number;
    user: any;
    status:
      | SubmissionStatus.DRAFT
      | SubmissionStatus.REJECTED
      | SubmissionStatus.SUBMITTED
      | null;
  }) {
    try {
      const bucketName = process.env.S3_BUCKET_NAME;
      const s3BaseUrl = `https://${bucketName}.s3.amazonaws.com/`;
      const skip = (page - 1) * count;

      const queryData = await this.eventassigntorateRepo
        .createQueryBuilder('eventAssignRate')
        .leftJoinAndSelect('eventAssignRate.submission', 'submission')
        .where('eventAssignRate.juryId = :juryId', {
          juryId: user.userId,
        })
        .andWhere(
          'submission.submissionStatus = :status AND submission.categoryId = :categoryId AND submission.eventId = :eventId',
          {
            status:
              status === 'rejected'
                ? SubmissionStatus.REJECTED
                : SubmissionStatus.SUBMITTED,
            categoryId,
            eventId,
          },
        )
        .getMany();

      const allSubmissions = [];
      for (const item of queryData) {
        allSubmissions.push(item.submission);
      }

      let ratedSubmissions = [];
      const ratedList = queryData.filter(
        (item) => item.ratingStatus === RatingStatusEnum.RATED,
      );
      if (buckets.toLowerCase() == 'rated') {
        const query = this.eventRatingRepo
          .createQueryBuilder('rating')
          .leftJoinAndSelect('rating.submission', 'submission')
          .where('rating.eventId = :eventId', { eventId })
          .andWhere('rating.juryId = :juryId', { juryId: user.userId })
          .andWhere('submission.categoryId = :categoryId', { categoryId });

        if (rating.length > 0) {
          query.andWhere('rating.rating IN (:...rating)', { rating });
        }

        const ratedData = await query.getMany();

        for (const item of ratedList) {
          const refinedRatedData = ratedData.filter(
            (ratedDataItem) => ratedDataItem.submissionId === item.submissionId,
          );
          const presignedThumbnailUrl =
            await this.fileUploadService.generateGetObjectPresignedUrl(
              item.submission.thumbnail,
            );
          const artworksWithPresigned = await Promise.all(
            item.submission.artworks.map(async (artwork) => {
              const presignedUrl =
                await this.fileUploadService.generateGetObjectPresignedUrl(
                  artwork.artworkUrl,
                );
              return { ...artwork, artworkUrl: presignedUrl };
            }),
          );

          if (refinedRatedData.length > 0) {
            ratedSubmissions.push({
              submissionID: item.submissionId,
              studentId: refinedRatedData[0].studentId,
              rating: refinedRatedData[0].rating ?? 0,
              wishlist: refinedRatedData[0].wishlist ? 1 : 0,
              zap: refinedRatedData[0].zap ? 1 : 0,
              thumbnail: presignedThumbnailUrl,
              artworks: artworksWithPresigned,
              submissionStatus: item.submission.submissionStatus,
              ratingStatus: refinedRatedData[0].status,
            });
          }
        }
      }

      const nonRatedSubmissions = [];
      const notRatedList = queryData.filter(
        (item) => item.ratingStatus === RatingStatusEnum.NOT_RATED,
      );
      const ratedData = await this.eventRatingRepo.find({
        where: { eventId, juryId: user.userId },
      });
      if (buckets?.toLowerCase() === 'nonrated') {
        for (const item of notRatedList) {
          const refinedRatedData = ratedData.filter(
            (ratedDataItem) => ratedDataItem.submissionId === item.submissionId,
          );
          const presignedThumbnailUrl =
            await this.fileUploadService.generateGetObjectPresignedUrl(
              item.submission.thumbnail,
            );
          const artworksWithPresigned = await Promise.all(
            item.submission.artworks.map(async (artwork) => {
              const presignedUrl =
                await this.fileUploadService.generateGetObjectPresignedUrl(
                  artwork.artworkUrl,
                );
              return { ...artwork, artworkUrl: presignedUrl };
            }),
          );

          nonRatedSubmissions.push({
            submissionID: item.submissionId,
            studentId: item.submission.studentId,
            rating: 0,
            wishlist: refinedRatedData.length > 0 && refinedRatedData[0].wishlist ? 1 : 0,
            zap: 0,
            thumbnail: presignedThumbnailUrl,
            artworks: artworksWithPresigned,
            submissionStatus: item.submission.submissionStatus,
            ratingStatus:
              refinedRatedData.length > 0 && refinedRatedData[0].status
                ? refinedRatedData[0].status
                : '',
          });
        }
      }

      let wishlistSubmissions = [];
      const wishlistData = await this.eventRatingRepo.find({
        where: { eventId, juryId: user.userId, wishlist: true },
      });
      if (buckets?.toLowerCase() === 'wishlist') {
        for (const item of wishlistData) {
          const wishlistSubmission = await this.submissionRepo.find({
            where: { id: item.submissionId },
          });
          const presignedThumbnailUrl =
            await this.fileUploadService.generateGetObjectPresignedUrl(
              wishlistSubmission[0].thumbnail,
            );
          const artworksWithPresigned = await Promise.all(
            wishlistSubmission[0].artworks.map(async (artwork) => {
              const presignedUrl =
                await this.fileUploadService.generateGetObjectPresignedUrl(
                  artwork.artworkUrl,
                );
              return { ...artwork, artworkUrl: presignedUrl };
            }),
          );
          wishlistSubmissions.push({
            submissionID: wishlistSubmission[0].id,
            studentId: item.studentId,
            rating: item.rating ?? 0,
            wishlist: item.wishlist ? 1 : 0,
            zap: item.zap ? 1 : 0,
            thumbnail: presignedThumbnailUrl,
            artworks: artworksWithPresigned,
            submissionStatus: wishlistSubmission[0].submissionStatus,
            ratingStatus: item.status,
          });
        }
      }

      let zapSubmissions = [];
      const zapData = await this.eventRatingRepo.find({
        where: { eventId, juryId: user.userId, categoryId, zap: true },
      });
      if (buckets?.toLowerCase() === 'zap') {
        for (const item of zapData) {
          const zapSubmission = await this.submissionRepo.find({
            where: { id: item.submissionId },
          });
          const presignedThumbnailUrl =
            await this.fileUploadService.generateGetObjectPresignedUrl(
              zapSubmission[0].thumbnail,
            );
          const artworksWithPresigned = await Promise.all(
            zapSubmission[0].artworks.map(async (artwork) => {
              const presignedUrl =
                await this.fileUploadService.generateGetObjectPresignedUrl(
                  artwork.artworkUrl,
                );
              return { ...artwork, artworkUrl: presignedUrl };
            }),
          );
          zapSubmissions.push({
            categoryId: item.categoryId,
            submissionID: zapSubmission[0].id,
            studentId: item.studentId,
            rating: item.rating ?? 0,
            wishlist: item.wishlist ? 1 : 0,
            zap: item.zap ? 1 : 0,
            thumbnail: presignedThumbnailUrl,
            artworks: artworksWithPresigned,
            submissionStatus: zapSubmission[0].submissionStatus,
            ratingStatus: item.status,
          });
        }
      }

      const eventCourseCategoryData = await this.eventCategoryRepository.find({
        where: { id: categoryId },
      });
      const categoryName = eventCourseCategoryData[0]?.categoryName || '';

      let filteredList = [];
      switch (buckets?.toLowerCase()) {
        case 'rated':
          filteredList = ratedSubmissions;
          break;
        case 'nonrated':
          filteredList = nonRatedSubmissions;
          break;
        case 'wishlist':
          filteredList = wishlistSubmissions;
          break;
        case 'zap':
          filteredList = zapSubmissions;
          break;
      }

      const isBucketEmpty = !buckets;
      const targetList = isBucketEmpty ? allSubmissions : filteredList;
      const paginatedList = targetList.slice(skip, skip + count);

      return {
        totalsubmission: allSubmissions.length,
        nonRated: notRatedList.length,
        rated: ratedList.length,
        wishlist: wishlistData.length,
        zap: zapData.length,
        categoryId,
        categoryName,
        submissions: paginatedList,
        totalFiltered: targetList.length,
        currentPage: page,
        pageCount: count,
      };
    } catch (error) {
      console.error('Error in getFilteredSubmissions:', error);
      throw new InternalServerErrorException('Failed to fetch filtered submissions.');
    }
  }

  async getCrevalRating(imageUrl: string) {
    const apiUrl =
      'https://stagingapi.proalley.com/api/creval/getArtworkEvaluationReport';
    const fullUrl = `${apiUrl}?url=${encodeURIComponent(imageUrl)}&score_only=True`;
    let data: any;

    try {
      const response = await fetch(fullUrl);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      data = await response.json();
    } catch (error) {
      data = {};
    }

    return data;
  }

  async createRating(dto: CreateEventRatingDto) {
    const { studentId, submissionId, status, juryId, juryRole, eventId, categoryId } =
      dto;

    if (status === RatingStatus.PUBLISH && !submissionId) {
      if (!juryId || !juryRole || !eventId || !categoryId) {
        throw new BadRequestException(
          'juryId, juryRole, categoryId and eventId are required for publish.',
        );
      }

      const ratingsToPublish = await this.eventRatingRepo.find({
        where: {
          juryId,
          juryRole,
          eventId,
          categoryId,
          status: RatingStatus.SUBMIT,
          zap: true,
        },
      });

      if (ratingsToPublish.length === 0) {
        throw new BadRequestException('No eligible ratings found to publish.');
      }

      const updatedRatings = ratingsToPublish.map((rating) => {
        rating.status = RatingStatus.PUBLISH;
        rating.updatedAt = new Date();
        return rating;
      });

      const result = await this.eventRatingRepo.save(updatedRatings);

      return {
        message: `${result.length} ratings published successfully.`,
        ratings: result,
      };
    }

    let ratingWhere: Record<string, number | boolean | string> = {};
    ratingWhere = {
      juryId,
      eventId,
      categoryId,
    };
    if (status !== RatingStatus.PUBLISH) {
      // consider submission id in case of rating status is submited
      ratingWhere.submissionId = submissionId;

      const submission = await this.submissionRepo.findOne({
        where: { id: submissionId },
      });

      // Get AI rating for artworks
      // for (const item of submission.artworks) {
      //   if (
      //     item.fileType.toLocaleLowerCase() == 'pdf' ||
      //     item.fileType.toLocaleLowerCase() == 'image'
      //   ) {
      //     const fileURL = await this.fileUploadService.generateGetObjectPresignedUrl(
      //       item.artworkUrl,
      //     );
      //     const crevalRating = await this.getCrevalRating(fileURL);
      //     dto.aiRating = crevalRating.final_score || 0;
      //     dto.aiPlagiarised = crevalRating.Plagiarised || 0;
      //   }
      // }

      if (!submission) {
        throw new NotFoundException('Submission not found.');
      }

      if (submission.studentId !== studentId) {
        throw new BadRequestException('You are not allowed to rate this submission.');
      }
    }

    let existingRatings: EventRating[] = [];
    if (status === RatingStatus.PUBLISH) {
      // set zap true in case of publish
      ratingWhere.zap = true;

      existingRatings = await this.eventRatingRepo.find({
        where: ratingWhere,
      });
    } else {
      const single = await this.eventRatingRepo.findOne({
        where: ratingWhere,
      });
      if (single) {
        existingRatings = [single]; // wrap in array
      }
    }

    if (status && !Object.values(RatingStatus).includes(status)) {
      throw new BadRequestException(
        `Invalid status. Allowed values are: ${Object.values(RatingStatus).join(', ')}`,
      );
    }

    const isInvalidRating = dto.rating === null || dto.rating === 0;
    if (isInvalidRating) {
      if (dto.zap) {
        throw new BadRequestException(
          'Zap cannot be selected when rating is 0 or not provided.',
        );
      }
      if (status === RatingStatus.SUBMIT) {
        throw new BadRequestException('Please provide a rating before submitting.');
      }
    }

    if (status === RatingStatus.PUBLISH) {
      if (existingRatings.length === 0) {
        throw new BadRequestException(
          'You must first submit the rating before publishing.',
        );
      }

      for (const item of existingRatings) {
        if (!item.zap) {
          throw new BadRequestException('Only zapped submissions can be published.');
        }

        if (item.status === RatingStatus.PUBLISH) {
          throw new BadRequestException('This rating has already been published.');
        }

        if (item.status !== RatingStatus.SUBMIT) {
          throw new BadRequestException(
            'You can only publish a rating after submitting it.',
          );
        }

        item.status = RatingStatus.PUBLISH;
        item.updatedAt = new Date();

        await this.eventRatingRepo.save(item);
      }
    }

    if (existingRatings.length == 0) {
      if (status && status !== RatingStatus.SUBMIT) {
        throw new BadRequestException('You must submit the rating before publishing.');
      }

      const newRating = this.eventRatingRepo.create({
        ...dto,
        aiRating: dto.aiRating ?? null,
        rating: dto.rating ?? null,
        feedback: dto.feedback ?? null,
        status: dto.status ?? null,
        wishlist: !!dto.wishlist,
        wildcard: !!dto.wildcard,
        zap: !!dto.zap,
      });

      const createRatingResponse = await this.eventRatingRepo.save(newRating);
      if (
        createRatingResponse &&
        dto.rating != undefined &&
        dto.status == RatingStatus.SUBMIT
      ) {
        return await this.eventassigntorateRepo.update(
          { juryId: juryId, submissionId: submissionId, categoryId: categoryId },
          { ratingStatus: RatingStatusEnum.RATED },
        );
      }
    } else {
      const updateParam: Record<string, boolean | number | string> = {};
      if (status === RatingStatus.SUBMIT) {
        if (dto.wishlist !== undefined) {
          updateParam.wishlist = !!dto.wishlist;
          updateParam.status = existingRatings[0].status;
        }
        if (dto.wildcard !== undefined) {
          updateParam.wildcard = !!dto.wildcard;
        }
        if (dto.zap !== undefined) {
          updateParam.zap = !!dto.zap;
          updateParam.rating = dto.rating;
          updateParam.status = dto.status;
        }
        if (dto.rating != undefined && dto.status == RatingStatus.SUBMIT) {
          await this.eventassigntorateRepo.update(
            { juryId: juryId, submissionId: submissionId, categoryId: categoryId },
            { ratingStatus: RatingStatusEnum.RATED },
          );
        }
        return await this.eventRatingRepo.update(
          {
            submissionId: submissionId,
            juryId: juryId,
            studentId: studentId,
            eventId: eventId,
            categoryId: categoryId,
          },
          updateParam,
        );
      } else {
        return await this.eventRatingRepo.update(
          {
            juryId: juryId,
            eventId: eventId,
            categoryId: categoryId,
            zap: true,
          },
          {
            status: dto.status,
          },
        );
      }
    }

    throw new BadRequestException(
      'You have already submitted a rating for this submission.',
    );
  }

  async assignToIntJury(submissions: EventSubmission[], usersData: User[]) {
    const juryCount = usersData.length;

    const alignedCount = Math.floor(submissions.length / juryCount) * juryCount; // 100
    const alignedSubmissions = submissions.slice(0, alignedCount); // first 100
    const extraSubmissions = submissions.slice(alignedCount); // remaining 5

    // Split evenly among juries
    const submissionsPerJury = alignedCount / juryCount;
    const juryAssignments: EventSubmission[][] = [];

    for (let i = 0; i < juryCount; i++) {
      const start = i * submissionsPerJury;
      const end = start + submissionsPerJury;
      juryAssignments.push(alignedSubmissions.slice(start, end));
    }

    for (let i = 0; i < juryAssignments.length; i++) {
      const jury = usersData[i];

      for (const submission of juryAssignments[i]) {
        const exists = await this.eventassigntorateRepo.findOne({
          where: {
            juryId: jury.userId,
            submissionId: submission.id,
            eventId: submission.eventId,
            juryType: JuryRole.INTERNAL,
          },
        });

        if (!exists) {
          const newAssignment = this.eventassigntorateRepo.create({
            submissionId: submission.id,
            categoryId: submission.categoryId,
            eventId: submission.eventId,
            juryId: jury.userId,
            juryType: JuryRole.INTERNAL,
            ratingStatus: RatingStatusEnum.NOT_RATED, // Optional, as default is set
          });

          await this.eventassigntorateRepo.save(newAssignment);
        } else {
          logger.debug(
            `Assignment already exists for jury ${jury.userId} and submission ${submission.id}`,
          );
        }
      }
    }

    return {
      message: 'Assignment completed',
      totalSubmissions: submissions.length,
      assignedSubmissions: alignedSubmissions.length,
      skippedSubmissions: extraSubmissions.length,
      skippedSubmissionIds: extraSubmissions.map((s) => s.id),
    };
  }

  async assignToExtJury(submissions: EventSubmission[], usersData: any) {
    let alignedSubmissions: number = 0;
    for (const submission of submissions) {
      const bulkInsertData = [];

      for (let i = 0; i < usersData.length; i++) {
        const exists = await this.eventassigntorateRepo.findOne({
          where: {
            juryId: usersData[i].userId,
            submissionId: submission.id,
            eventId: submission.eventId,
            juryType: JuryRole.EXTERNAL,
          },
        });

        if (!exists && usersData[i].expertsIn.includes(submission.categoryId)) {
          bulkInsertData.push({
            submissionId: submission.id,
            categoryId: submission.categoryId,
            eventId: submission.eventId,
            juryId: usersData[i].userId,
            juryType: JuryRole.EXTERNAL,
            ratingStatus: RatingStatusEnum.NOT_RATED, // Optional, as default is set
          });
        } else {
          logger.debug(
            `Assignment already exists for jury ${usersData[i].userId} and submission ${submission.id}`,
          );
        }
      }
      alignedSubmissions += bulkInsertData.length;
      await this.eventassigntorateRepo.save(bulkInsertData);
    }

    return {
      message: 'Assignment completed',
      totalSubmissions: submissions.length,
      assignedSubmissions: alignedSubmissions,
    };
  }

  async assignSubmission(payload: AssignSubmissionDto) {
    const { eventId, juryType, brandId } = payload;
    let response;

    const submissionQuery = this.submissionRepo
      .createQueryBuilder('submission')
      .where('submission.submissionStatus = :submissionStatus', {
        submissionStatus: SubmissionStatus.SUBMITTED,
      })
      .andWhere('submission.eventId = :eventId', { eventId: eventId })
      .orderBy('submission.id', 'ASC');

    // Internal Jury published rating should assign to external jury
    if (juryType.includes(JuryRole.EXTERNAL)) {
      submissionQuery.innerJoinAndSelect('submission.ratings', 'rating');
      submissionQuery.andWhere(
        'rating.juryRole = :juryRole AND rating.status = :status',
        {
          juryRole: JuryRole.INTERNAL,
          status: RatingStatus.PUBLISH,
        },
      );
    }
    const submissionData = await submissionQuery.getMany();

    if (juryType.includes(JuryRole.INTERNAL)) {
      const usersQuery = this.userRepository
        .createQueryBuilder('user')
        .where('user.roles && :roles', {
          roles: [juryType],
        })
        .andWhere('user.brandId = :brandId', { brandId: brandId });
      const usersData = await usersQuery.getMany();
      response = await this.assignToIntJury(submissionData, usersData);
    } else {
      const eventJuryQuery = this.eventJury
        .createQueryBuilder('eventJury')
        .innerJoinAndSelect('eventJury.user', 'user')
        .where('eventJury.juryRole = :roles', {
          roles: juryType,
        })
        .andWhere('user.brandId = :brandId', { brandId: brandId });
      const eventJuryData = await eventJuryQuery.getMany();
      const usersData = eventJuryData.map((jury) => ({
        ...jury.user,
        expertsIn: JSON.parse(jury.expertsIn || '[]'),
      }));
      response = await this.assignToExtJury(submissionData, usersData);
    }

    return response;
  }

  async getPublishedList(
    categoryId: number,
    eventId: number,
    juryType: JuryRole,
    winner: number,
    runnerUp: number,
    wildcard: number,
    module: string,
    queryParams: QueryParamsDto & { filter?: FilterEventRatingDto },
  ): Promise<any> {
    try {
      const bucketName = process.env.S3_BUCKET_NAME;
      const { page = 1, limit = 10 } = queryParams;
      const skip = (page - 1) * limit;

      let data = [];
      let total = 0;
      let wildcardProcessed;

      // verify event exist using event id & get config
      const event = await this.eventRepository.findOne({ where: { id: eventId } });
      if (!event) throw new BadRequestException('Invalid event ID');
      const categoryConfigMap = event.categoryConfig ?? {};
      const categoryConfig = categoryConfigMap[String(categoryId)] ?? {
        winner: 1,
        runnerUp: 2,
      };

      // get all center list
      const centerDetails = this.centerRepository.find();

      // Get category Name by id
      const eventCourseCategoryData = await this.eventCategoryRepository.find({
        where: { id: categoryId },
      });
      const categoryName = eventCourseCategoryData[0]?.categoryName || '';

      // get and count wildcard data
      const wildcardList = await this.eventRatingRepo.find({
        where: {
          eventId,
          categoryId,
          juryRole: juryType,
          wildcard: true,
          status: RatingStatus.PUBLISH,
        },
        order: { id: 'ASC' },
      });

      const wildcardCount = wildcardList.length;

      // Winner runner-up & wildcard listing
      const query = this.eventRatingRepo
        .createQueryBuilder('rating')
        .leftJoinAndSelect('rating.submission', 'submission')
        .leftJoin('event_winners', 'winner', 'winner.submissionId = submission.id')
        .select([
          'rating.studentId AS "studentId"',
          'rating.eventId AS "eventId"',
          'rating.categoryId AS "categoryId"',
          'rating.juryRole AS "juryRole"',
          'rating.wildcard AS "wildcard"',

          'ROUND(AVG(rating.rating)::numeric, 1) AS "avgRating"',
          'MAX(rating.id) AS "latestRatingId"',

          'submission.id AS "submissionId"',
          'submission.thumbnail AS "thumbnail"',
          'submission.artworks AS "artworks"',
          'submission.centreId AS "centreId"',
        ]);
      if (juryType == JuryRole.EXTERNAL) {
        query.andWhere('rating.status = :status', { status: RatingStatus.PUBLISH });
        if (module == 'announceWinner') {
          query.groupBy(`
            rating.studentId,
            rating.eventId,
            rating.categoryId,
            rating.juryRole,
            rating.wildcard,
            submission.id
          `);
        }
      } else {
        query.andWhere('rating.status != :status', { status: RatingStatus.REJECT });
        query.andWhere('rating.wildcard = :wildcard', { wildcard: 0 });
      }
      query.andWhere('rating.eventId = :eventId', { eventId: eventId });
      query.andWhere('rating.juryRole = :juryType', { juryType: juryType });
      query.andWhere('rating.categoryId = :categoryId', { categoryId: categoryId });
      query.andWhere('winner.submissionId IS NULL');

      if (!module || module != 'announceWinner') {
        query.skip(skip).take(limit);
      }

      // eslint-disable-next-line prefer-const
      query.orderBy('"avgRating"', 'DESC').addOrderBy('"latestRatingId"', 'DESC');

      // const [sql, params] = query.getQueryAndParameters();
      // console.log('SQL:', sql);
      // console.log('Params:', params);

      const waitList = await query.getRawMany();
      const waitListCount = waitList.length;

      // console.log(waitList);

      if (!winner && !runnerUp && !wildcard) {
        if (!waitList) {
          throw new NotFoundException('No rating found for this winner/runner-up');
        }

        for (const rating of waitList) {
          // console.log(rating.latestRatingId);
          const winnerData = await this.eventWinnerRepo.findOne({
            where: { ratingId: rating.latestRatingId },
          });

          // console.log(winnerData);
          if (winnerData) {
            continue;
          }

          // fetch submission data for winner/runner-up
          const submission = await this.submissionRepo.findOne({
            where: { id: rating.submissionId },
          });

          // find center name
          const centerDetail = (await centerDetails).filter(
            (cn) => Number(cn.centreKey) == submission.centreId,
          );

          // Generate thumbnail presigned
          const thumbnail = await this.fileUploadService.generateGetObjectPresignedUrl(
            submission.thumbnail || '',
          );

          // generate artwork presigned
          const artworks = await Promise.all(
            (submission.artworks || []).map(async (art) => {
              const presignedUrl =
                await this.fileUploadService.generateGetObjectPresignedUrl(
                  art.artworkUrl,
                );
              return { ...art, artworkUrl: presignedUrl };
            }),
          );

          data.push({
            studentId: rating.studentId,
            submissionId: submission.id,
            centreId: submission.centreId,
            centerName: centerDetail.length > 0 ? centerDetail[0].name : '',
            categoryId: rating.categoryId,
            eventId: rating.eventId,
            juryRole: rating.juryRole,
            rating: rating.avgRating,
            ratingId: rating.latestRatingId,
            wildcard: rating.wildcard ? 1 : 0,
            winner: 0,
            winnerOrder: null,
            runnerUp: 0,
            runnerUpOrder: null,
            thumbnail,
            artworks,
          });

          total = waitListCount;
        }
      }

      // console.log(data);

      // if winner requrieds
      let winners = [];
      const winnerOrderMap = new Map();
      const runnerUpOrderMap = new Map();
      if (winner === 1 || runnerUp === 1) {
        const winnerList = await this.eventWinnerRepo.find({
          where: { eventId, categoryId, winner: 1 },
          order: { id: 'ASC' },
        });

        const runnerUpList = await this.eventWinnerRepo.find({
          where: { eventId, categoryId, runnerUp: 1 },
          order: { id: 'ASC' },
        });

        winnerList.forEach((w, index) => {
          winnerOrderMap.set(w.submissionId, (index + 1).toString());
        });

        runnerUpList.forEach((r, index) => {
          runnerUpOrderMap.set(r.submissionId, (index + 1).toString());
        });

        let where: any = { eventId, categoryId };
        if (winner === 1 && runnerUp === 1) {
          where = [
            { eventId, categoryId, winner: 1 },
            { eventId, categoryId, runnerUp: 1 },
          ];
        } else if (winner === 1) {
          where.winner = 1;
        } else if (runnerUp === 1) {
          where.runnerUp = 1;
        } else {
          where = [
            { eventId, categoryId, winner: 0 },
            { eventId, categoryId, runnerUp: 0 },
          ];
        }

        const records = await this.eventWinnerRepo.find({
          where,
          skip,
          take: limit,
        });

        data = await Promise.all(
          records.map(async (rec) => {
            // fetch submission data for winner/runner-up
            const submission = await this.submissionRepo.findOne({
              where: { id: rec.submissionId },
            });

            // fetch rating for winner/runner-up
            const rating = await this.eventRatingRepo.findOne({
              where: {
                submissionId: rec.submissionId,
                eventId,
                categoryId,
                juryRole: juryType,
                status: RatingStatus.PUBLISH,
              },
            });

            if (!submission || !rating) {
              throw new NotFoundException(
                'No submission & rating found for this winner/runner-up',
              );
            }

            // find center name
            const centerDetail = (await centerDetails).filter(
              (cn) => Number(cn.centreKey) == submission.centreId,
            );

            // Generate thumbnail presigned
            const thumbnail = await this.fileUploadService.generateGetObjectPresignedUrl(
              submission.thumbnail || '',
            );

            // generate artwork presigned
            const artworks = await Promise.all(
              (submission.artworks || []).map(async (art) => {
                const presignedUrl =
                  await this.fileUploadService.generateGetObjectPresignedUrl(
                    art.artworkUrl,
                  );
                return { ...art, artworkUrl: presignedUrl };
              }),
            );

            return {
              studentId: rec.studentId,
              submissionId: submission.id,
              centreId: submission.centreId,
              centerName: centerDetail.length > 0 ? centerDetail[0].name : '',
              categoryId: rec.categoryId,
              eventId: rec.eventId,
              juryRole: rating.juryRole,
              rating: rating.rating,
              ratingId: rating.id,
              wildcard: rating.wildcard ? 1 : 0,
              winner: rec.winner,
              winnerOrder: winnerOrderMap.get(rec.submissionId) || null,
              runnerUp: rec.runnerUp,
              runnerUpOrder: runnerUpOrderMap.get(rec.submissionId) || null,
              thumbnail,
              artworks,
            };
          }),
        );

        total = waitListCount;
        data = data.filter(Boolean);

        const winnerRecords = await this.eventWinnerRepo.find({
          where: { eventId, categoryId },
          order: { id: 'ASC' },
        });

        winners = await Promise.all(
          winnerRecords.map(async (w) => {
            const submission = await this.submissionRepo.findOne({
              where: { id: w.submissionId },
            });

            // find center name
            const centerDetail = (await centerDetails).filter(
              (cn) => Number(cn.centreKey) == submission.centreId,
            );

            return {
              studentId: w.studentId,
              submissionId: w.submissionId,
              categoryId: w.categoryId,
              eventId: w.eventId,
              ratingId: w.ratingId,
              winner: w.winner,
              runnerUp: w.runnerUp,
              centreId: submission?.centreId ?? null,
              centerName: centerDetail.length > 0 ? centerDetail[0].name : '',
            };
          }),
        );
      }

      // if wildcard data needed
      if (wildcard == 1) {
        if (juryType !== 'intJury') {
          console.error('Wildcard Flag Accept Only With IntJury');
          throw new BadRequestException('Wildcard Flag Accept Only With IntJury');
        }

        const ratingWhere: Record<string, number | boolean | string> = {};
        ratingWhere.eventId = eventId;
        ratingWhere.categoryId = categoryId;
        ratingWhere.juryRole = juryType;
        ratingWhere.status = RatingStatus.PUBLISH;
        ratingWhere.wildcard = false;

        // fetch rating for winner/runner-up
        const totalCount = await this.eventRatingRepo.count({
          where: ratingWhere,
        });

        wildcardProcessed = await Promise.all(
          wildcardList.map(async (wc) => {
            return {
              studentId: wc.studentId,
              submissionId: wc.submissionId,
              categoryId: wc.categoryId,
              eventId: wc.eventId,
              ratingId: wc.id,
              rating: wc.rating,
              wildcard: true,
            };
          }),
        );

        const query = this.eventRatingRepo
          .createQueryBuilder('rating')
          .leftJoinAndSelect('rating.submission', 'submission')
          .select([
            'rating.id',
            'rating.rating',
            'rating.juryRole',
            'rating.wildcard',
            'rating.categoryId',
            'rating.eventId',
            'rating.studentId',
            'submission.artworks',
            'submission.centreId',
            'submission.id',
            'submission.thumbnail',
          ]);

        if (wildcard === 1) {
          query.where('rating.status = :status AND rating.wildcard = :wildcard', {
            status: RatingStatus.PUBLISH,
            wildcard: true,
          });
        } else {
          query.where('rating.status IN (:...statuses)', {
            statuses: [RatingStatus.SUBMIT, RatingStatus.PUBLISH],
          });
          query.andWhere('rating.rating > 0');
        }

        if (eventId) query.andWhere('rating.eventId = :eventId', { eventId });
        if (categoryId) query.andWhere('rating.categoryId = :categoryId', { categoryId });
        if (juryType) query.andWhere('rating.juryRole = :juryType', { juryType });

        const ratings = await query
          .orderBy('rating.id', 'DESC')
          .skip(skip)
          .take(limit)
          .getMany();

        data = await Promise.all(
          ratings.map(async (r) => {
            // Generate thumbnail presigned
            const thumbnail = await this.fileUploadService.generateGetObjectPresignedUrl(
              r.submission?.thumbnail || '',
            );

            // generate artwork presigned
            const artworks = await Promise.all(
              (r.submission?.artworks || []).map(async (art) => {
                const presignedUrl =
                  await this.fileUploadService.generateGetObjectPresignedUrl(
                    art.artworkUrl,
                  );
                return { ...art, artworkUrl: presignedUrl };
              }),
            );

            // find center name
            const centerDetail = (await centerDetails).filter(
              (cn) => Number(cn.centreKey) == r.submission.centreId,
            );

            return {
              studentId: r.studentId,
              submissionId: r.submission.id,
              centreId: r.submission.centreId,
              centerName: centerDetail.length > 0 ? centerDetail[0].name : '',
              categoryId: r.categoryId,
              eventId: r.eventId,
              juryRole: r.juryRole,
              rating: r.rating,
              ratingId: r.id,
              wildcard: r.wildcard ? 1 : 0,
              winner: 0,
              winnerOrder: winnerOrderMap.get(r.submission.id) || 0,
              runnerUp: 0,
              runnerUpOrder: runnerUpOrderMap.get(r.submission.id) || 0,
              thumbnail,
              artworks,
            };
          }),
        );

        total = totalCount;
      }

      const [winnerCount, runnerUpCount] = await Promise.all([
        this.eventWinnerRepo.count({
          where: { eventId, categoryId, winner: 1 },
        }),
        this.eventWinnerRepo.count({
          where: { eventId, categoryId, runnerUp: 1 },
        }),
      ]);

      return {
        categoryName,
        totalCount: total,
        currentPage: page,
        totalWinners: categoryConfig.winner,
        totalRunnerUp: categoryConfig.runnerUp,
        winnerCount,
        runnerUpCount,
        wildcardCount,
        limit,
        submissions: data,
        winners,
        wildcard: wildcardProcessed,
      };
    } catch (error) {
      console.error('Error in getPublishedRatings:', error);

      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to fetch published ratings.');
    }
  }

  async updateRating(updateDto: UpdateEventRatingDto): Promise<any> {
    const { ratingId, wildcard, ...updateData } = updateDto;

    const rating = await this.eventRatingRepo.findOne({ where: { id: ratingId } });
    if (!rating) throw new NotFoundException('Rating not found');

    if (wildcard === 1) {
      if (rating.rating <= 0) {
        throw new BadRequestException('Rating must be greater than 0');
      }
      rating.wildcard = true;
      rating.status = RatingStatus.PUBLISH;
    } else {
      rating.wildcard = false;
      // changing status not required in case its published already
      // rating.status = RatingStatus.SUBMIT;
    }

    await this.eventRatingRepo.save(rating);

    return { rating, message: 'Rating updated successfully' };
  }
}
