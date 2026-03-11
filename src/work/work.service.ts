import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateWorkDto } from './dto/create-work.dto';
// import { UpdateWorkDto } from './dto/update-work.dto';
import { Work } from 'src/common/entities/work.entity';
import { EntityManager, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { WorkHistoryService } from './work-history.service';
import { UpdateWorkDto } from './dto/update-work.dto';
import { User } from 'src/common/entities/user.entity';
import { WorkStatus } from 'src/common/enum/work-status.enum';
import { BusinessException } from 'src/common/exceptions/business.exception';
import { FileService } from './file.service';
import { AddFilesDto } from './dto/add-file.dto';
import { FileUploadService } from 'src/file-upload/file-upload.service';
import { S3_WORK, S3_WORK_THUMBNAIL } from 'src/common/constants';
import { AddThumbnailDto } from './dto/add-thumbnail.dto';
import { WorkStatusDto } from './dto/work-status.dto';
import { filterQueryBuilder } from 'src/common/helper/query.helper';
import { FacultyWorkFilterDto, FacultyWorkQueryDto } from './dto/faculty-work-filter.dto';
import { generateUniqueFileName } from 'src/common/helper/file.helper';
import { WorkHistory } from 'src/common/entities/work-history.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  AddNotification,
  AddNotificationEvent,
} from 'src/notification/events/notification.event';
import { NotificationTypeValueEnum } from 'src/common/entities/notificationType.entity';
import { DeliveryTypeValueEnum } from 'src/common/entities/deliveryType.entity';
import {
  workAdded,
  workApproved,
  workRejected,
} from 'src/common/notification/work.notification';
import { UserWorkFilterDto, UserWorkQueryDto } from 'src/work/dto/user-work-filter.dto';
import { UpdateWorkVisibilityDto } from './dto/update-work-visibility.dto';
import { Portfolio } from 'src/common/entities/portfolio.entity';
import { PermissionException } from 'src/common/exceptions/permission.exception';
import { WorkView } from 'src/common/entities/workView.entity';
import { WorkLike } from 'src/common/entities/workLike.entity';
import { WORK_MESSAGES } from '../common/json/error-messages.json';
import { WorkComment } from 'src/common/entities/workComment.entity';
import { AddCommentDto } from './dto/add-comment.dto';
import { Follow } from 'src/common/entities/follow.entity';
import { Role } from 'src/common/enum/role.enum';
import { DefaultUserResponse } from 'src/common/strategy/jwt.strategy';
@Injectable()
export class WorkService {
  constructor(
    @InjectRepository(Work)
    private workRepository: Repository<Work>,

    @InjectRepository(WorkHistory)
    private workHistoryRepository: Repository<WorkHistory>,

    @InjectRepository(Portfolio)
    private portfolioRepository: Repository<Portfolio>,

    @InjectRepository(WorkView)
    private workViewRepository: Repository<WorkView>,

    @InjectRepository(WorkLike)
    private workLikeRepository: Repository<WorkLike>,

    @InjectRepository(WorkComment)
    private workCommentRepository: Repository<WorkComment>,

    @InjectRepository(Follow)
    private followRepository: Repository<Follow>,

    private workHistoryService: WorkHistoryService,
    private fileService: FileService,
    private fileUploadService: FileUploadService,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(
    user: DefaultUserResponse,
    createWorkDto: CreateWorkDto,
    manager: EntityManager,
  ) {
    let work = this.workRepository.create({
      ...createWorkDto,
      userId: user.id,
      brandId: user.activeRole.brandId,
    });
    if (createWorkDto.reviewRequired) {
      work.submittedAt = new Date();
    }

    work = await manager.save(work);

    const s3ThumbnailKey = `${S3_WORK}/${work.id}/${S3_WORK_THUMBNAIL}/${createWorkDto.thumbnailFileName}`;
    const thumbnailPresignedUrl =
      await this.fileUploadService.generatePutObjectPresignedUrl(s3ThumbnailKey);
    work.thumbnail = s3ThumbnailKey;
    work = await manager.save(work);

    createWorkDto.thumbnailFileName = s3ThumbnailKey;
    const workHistory = await this.workHistoryService.create(
      createWorkDto,
      work,
      manager,
    );

    let filePresignedUrls = [];
    for (const file of createWorkDto.addFiles) {
      const s3Key = `${S3_WORK}/${work.id}/${work.version}/${generateUniqueFileName(file.fileName)}`;
      const presignedUrl =
        await this.fileUploadService.generatePutObjectPresignedUrl(s3Key);
      filePresignedUrls.push({ ...file, presignedUrl: presignedUrl.url });

      await this.fileService.addFile(work, user.id, workHistory, s3Key, file, manager);
    }

    if (work.reviewRequired) {
      this.eventEmitter.emit(
        AddNotification,
        new AddNotificationEvent({
          type: NotificationTypeValueEnum.SOCIAL,
          data: workAdded(work),
          deliveryType: [DeliveryTypeValueEnum.WebApp, DeliveryTypeValueEnum.MobileApp],
          user: work.reviewerId,
        }),
      );
    }

    return { work, thumbnailPresignedUrl, filePresignedUrls };
  }

  async find({ workId, reviewerId }: { workId: number; reviewerId?: number }) {
    const whereCondition: { id: number; reviewerId?: number } = { id: workId };
    if (reviewerId) {
      whereCondition.reviewerId = reviewerId;
    }

    return await this.workRepository.findOne({
      where: whereCondition,
      relations: {
        category: true,
        workCategory: true,
      },
    });
  }

  async facultyShow({ workId, reviewerId }: { workId: number; reviewerId: number }) {
    let work = await this.find({ workId, reviewerId });

    if (!work) throw new NotFoundException();

    const files = await this.fileService.getFilesByWork(workId, work.version);
    work.files = files;
    return work;
  }

  async show({ workId, user }: { workId: number; user: DefaultUserResponse }) {
    const work = await this.workRepository
      .createQueryBuilder('work')
      .leftJoinAndSelect('work.files', 'files')
      .leftJoinAndSelect('work.category', 'categories')
      .leftJoinAndSelect('work.workCategory', 'workCategory')
      .innerJoin('work.user', 'user')
      .innerJoin('user.profile', 'profile')
      .select([
        'work',
        'files',
        'user.id',
        'user.brandId',
        'user.userId',
        'profile.firstName',
        'profile.middleName',
        'profile.lastName',
        'profile.profileImage',
        'categories.name',
        'workCategory.name',
      ])
      .where('work.id = :workId', { workId })
      .getOne();

    if (!work) throw new NotFoundException();

    if (work.brandId != user.activeRole.brandId) throw new BusinessException();

    const promises = [];
    let isFollowing = false;
    let isLiked = false;
    let isViewed = false;

    const files = await this.fileService.getFilesByWork(workId, work.version);
    work.files = files;

    const thumbnail = work.compressedThumbnail
      ? work.compressedThumbnail
      : work.thumbnail;

    if (thumbnail) {
      promises.push(
        this.fileUploadService.generateGetObjectPresignedUrl(thumbnail).then((url) => {
          work.thumbnail = url;
        }),
      );
    }

    if (work.user.profile.profileImage) {
      promises.push(
        this.fileUploadService
          .generateGetObjectPresignedUrl(work.user.profile.profileImage)
          .then((url) => {
            work.user.profile.profileImage = url;
          }),
      );
    }

    const followingPromise = this.followRepository
      .findOne({
        where: { follower: { id: user.id }, following: { id: work.user.id } },
      })
      .then((follow) => {
        isFollowing = !!follow;
      });

    const workLikePromise = this.workLikeRepository
      .findOne({
        where: { workId: workId, userId: user.id },
      })
      .then((workLike) => {
        isLiked = !!workLike;
      });

    const workViewPromise = this.workViewRepository
      .findOne({
        where: { workId: workId, userId: user.id },
      })
      .then((workView) => {
        isViewed = !!workView;
      });

    promises.push(followingPromise, workLikePromise, workViewPromise);

    await Promise.all(promises);

    work.user['isFollowing'] = isFollowing;
    work.user['isLiked'] = isLiked;
    work.user['isViewed'] = isViewed;
    return work;
  }

  async myWork(
    user: DefaultUserResponse,
    queryParams: UserWorkQueryDto,
    searchKeys?: string[],
  ) {
    const queryBuilderInstance = this.workRepository.createQueryBuilder('work');
    const queryBuilder = filterQueryBuilder({
      queryParams: queryParams,
      queryBuilder: queryBuilderInstance,
      filters: queryParams.filter,
      exclusions: queryParams.exclusion,
      searchKeys: searchKeys,
      hasMore: true,
    });

    queryBuilder.leftJoinAndSelect(
      'work.workLike',
      'work_like',
      'work_like.userId = :workUserId',
      { workUserId: user.id },
    );

    queryBuilder
      .leftJoinAndSelect('work.category', 'categories')
      .leftJoinAndSelect('work.workCategory', 'workCategory');

    const records = await queryBuilder.getMany();
    const nextPage = queryParams.limit != -1 ? records.length > queryParams.limit : false;
    const works = nextPage ? records.slice(0, -1) : records;

    const presignedUrlPromises = [];

    for (const work of works) {
      // Adding presigned URL for thumbnail
      const thumbnail = work.compressedThumbnail
        ? work.compressedThumbnail
        : work.thumbnail;

      if (thumbnail) {
        const thumbnailUrlPromise = this.fileUploadService
          .generateGetObjectPresignedUrl(thumbnail)
          .then((url) => {
            work.thumbnail = url;
          });
        presignedUrlPromises.push(thumbnailUrlPromise);
      }
    }

    await Promise.all(presignedUrlPromises);

    const newWorks = works.map((work) => {
      const { workLike, ...newWork } = work;
      newWork['isLiked'] = workLike.length > 0;

      return newWork;
    });

    if (queryParams.filter?.id?.length) {
      const reorderedWorks = [];
      queryParams.filter?.id.forEach((id) => {
        const item = newWorks.find((work) => work.id === id);
        if (item) {
          reorderedWorks.push(item);
        }
      });

      return { works: reorderedWorks, nextPage };
    }

    return { works: newWorks, nextPage };
  }

  async facultyWorkList(
    queryParams: FacultyWorkQueryDto,
    searchKeys?: string[],
  ): Promise<{ works: Work[]; count: number }> {
    const queryBuilderInstance = this.workRepository.createQueryBuilder('work');

    const queryBuilder = filterQueryBuilder({
      queryParams: queryParams,
      queryBuilder: queryBuilderInstance,
      filters: queryParams.filter,
      searchKeys: searchKeys,
      exclusions: queryParams.exclusion,
    });

    queryBuilder.leftJoinAndSelect('work.reviewer', 'reviewer');
    queryBuilder.leftJoinAndSelect('reviewer.profile', 'reviewerProfile');
    queryBuilder.leftJoinAndSelect('work.user', 'user');
    queryBuilder.leftJoinAndSelect('user.profile', 'profile');
    queryBuilder.select([
      'work.id',
      'work.status',
      'work.thumbnail',
      'work.submittedAt',
      'reviewer.id',
      'reviewer.userId',
      'reviewerProfile.id',
      'reviewerProfile.firstName',
      'reviewerProfile.lastName',
      'reviewerProfile.profileImage',
      'user.id',
      'user.userId',
      'profile.id',
      'profile.firstName',
      'profile.lastName',
      'profile.profileImage',
    ]);

    const [works, count] = await queryBuilder.getManyAndCount();

    const presignedUrlPromises = [];

    for (const work of works) {
      // Adding presigned URL for thumbnail
      if (work.thumbnail) {
        const thumbnailUrlPromise = this.fileUploadService
          .generateGetObjectPresignedUrl(work.thumbnail)
          .then((url) => {
            work.thumbnail = url;
          });
        presignedUrlPromises.push(thumbnailUrlPromise);
      }

      // Adding presigned URL for profile image
      const studentProfileImagePromise = this.fileUploadService
        .generateGetObjectPresignedUrl(work.user.profile.profileImage)
        .then((url) => {
          work.user.profile.profileImage = url;
        });
      presignedUrlPromises.push(studentProfileImagePromise);

      if (work?.reviewer?.profile) {
        const reviewerProfileImagePromise = this.fileUploadService
          .generateGetObjectPresignedUrl(work.user.profile.profileImage)
          .then((url) => {
            work.user.profile.profileImage = url;
          });
        presignedUrlPromises.push(reviewerProfileImagePromise);
      }
    }

    await Promise.all(presignedUrlPromises);
    return { works, count };
  }

  async facultyWorkById(workId: number, user: DefaultUserResponse): Promise<Work> {
    return await this.facultyShow({ workId, reviewerId: user.id });
  }

  async update(
    user: DefaultUserResponse,
    updateWorkDto: UpdateWorkDto,
    workId: number,
    manager: EntityManager,
  ) {
    let work = await this.find({ workId });
    if (!work) {
      throw new NotFoundException();
    }
    if (work.userId != user.id) {
      throw new PermissionException();
    }

    /* status == submitted | rejected | published can update */
    if (
      [WorkStatus.Submitted as string, WorkStatus.Rejected, WorkStatus.Approved].includes(
        work.status,
      )
    ) {
      throw new BusinessException(
        `Can't update in ${WorkStatus.Submitted}, ${WorkStatus.Rejected}, ${WorkStatus.Approved} status`,
      );
    }

    /* status == change_request update version */
    let version = work.version;
    const CurrentStatus = work.status;
    if (CurrentStatus === WorkStatus.ChangeRequest) {
      version++;
    }

    work.feedback = null;
    work = await manager.save({ ...work, ...updateWorkDto, version });
    let workHistory = await this.workHistoryService.getCurrentHistory(
      workId,
      work.version,
    );

    /* status == change_request create new history */
    if (CurrentStatus === WorkStatus.ChangeRequest) {
      await this.workHistoryService.create(
        { ...updateWorkDto, title: work.title },
        work,
        manager,
        version,
      );
    } else {
      await this.workHistoryService.update(updateWorkDto, workHistory, manager);
    }

    return work;
  }

  async removeUnpublishedWorkFromPortfolio(userId: number, workId: number) {
    try {
      this.portfolioRepository
        .createQueryBuilder()
        .update(Portfolio)
        .set({ workIds: () => `array_remove(workIds, ${workId})` })
        .where('userId=:userId', { userId })
        .execute();
    } catch (error) {
      console.error(error);
    }
  }

  async updateVisibility(
    user: DefaultUserResponse,
    updateVisibility: UpdateWorkVisibilityDto,
    workId: number,
  ) {
    const userId = user.id;
    let work = await this.find({ workId });

    if (!work) {
      throw new NotFoundException();
    }

    if (work.userId != user.id) {
      throw new PermissionException();
    }

    if (work.status !== WorkStatus.Approved)
      throw new BusinessException(WORK_MESSAGES.GET_YOUR_WORK_VERIFIED);

    if (updateVisibility.visibility === 0) {
      /**
       * dont add await will work in background
       */
      this.removeUnpublishedWorkFromPortfolio(userId, workId);
    }

    return await this.workRepository.save({
      ...work,
      visibility: updateVisibility.visibility,
    });
  }

  async updateStatus(
    user: DefaultUserResponse,
    workStatusDto: WorkStatusDto,
    workId: number,
    manager: EntityManager,
  ) {
    let work = await this.workRepository.findOneBy({ reviewerId: user.id, id: workId });

    if (!work) {
      throw new NotFoundException('No Such work found!');
    }

    if (
      [WorkStatus.Draft, WorkStatus.Approved, WorkStatus.Rejected].includes(
        work.status as WorkStatus,
      )
    ) {
      throw new BusinessException(
        `can not change status from ${work.status} to ${workStatusDto.status}`,
      );
    }

    work.status = workStatusDto.status;
    if (work.status === WorkStatus.Rejected) {
      work.feedback = workStatusDto.feedback;
    }

    work = await manager.save(work);

    let workHistory = await this.workHistoryService.getCurrentHistory(
      workId,
      work.version,
    );

    await this.workHistoryService.update(workStatusDto, workHistory, manager);

    const data =
      work.status == WorkStatus.Approved ? workApproved(work) : workRejected(work);
    this.eventEmitter.emit(
      AddNotification,
      new AddNotificationEvent({
        type: NotificationTypeValueEnum.SOCIAL,
        data: data,
        deliveryType: [DeliveryTypeValueEnum.WebApp, DeliveryTypeValueEnum.MobileApp],
        user: work.userId,
      }),
    );

    return work;
  }

  async addThumbnail(
    workId: number,
    user: DefaultUserResponse,
    addThumbnailDto: AddThumbnailDto,
    manager: EntityManager,
  ) {
    let work = await this.find({ workId });
    if (!work) {
      throw new NotFoundException();
    }

    if (work.userId != user.id) {
      throw new PermissionException();
    }

    const s3Key = `${S3_WORK}/${workId}/${S3_WORK_THUMBNAIL}/${addThumbnailDto.fileName}`;
    const presignedUrl = this.fileUploadService.generatePutObjectPresignedUrl(s3Key);

    work.thumbnail = s3Key;
    await manager.save(work);

    let workHistory = await this.workHistoryService.getCurrentHistory(
      workId,
      work.version,
    );
    workHistory.thumbnail = s3Key;
    await manager.save(workHistory);

    return presignedUrl;
  }

  async addFile(workId: number, user: DefaultUserResponse, addFilesDto: AddFilesDto) {
    const work = await this.find({ workId });
    if (!work) {
      throw new NotFoundException();
    }

    if (work.userId != user.id) {
      throw new PermissionException();
    }

    const workHistory = await this.workHistoryService.getCurrentHistory(
      workId,
      work.version,
    );

    let presignedUrls = [];
    for (const file of addFilesDto.addFiles) {
      const s3Key = `${S3_WORK}/${workId}/${work.version}/${generateUniqueFileName(file.fileName)}`;
      const presignedUrl =
        await this.fileUploadService.generatePutObjectPresignedUrl(s3Key);
      presignedUrls.push({ ...file, presignedUrl: presignedUrl.url });

      await this.fileService.addFile(work, user.id, workHistory, s3Key, file);
    }

    return presignedUrls;
  }

  async deleteFile(workId: number, user: DefaultUserResponse, fileId: number) {
    const work = await this.find({ workId });
    if (!work) {
      throw new NotFoundException();
    }

    if (work.userId != user.id) {
      throw new PermissionException();
    }

    const file = await this.fileService.find(fileId);
    if (!file) {
      throw new NotFoundException();
    }

    await this.fileUploadService.deleteFileFromS3(file.filePath);

    return await this.fileService.deleteFile(fileId);
  }

  async addView(user: DefaultUserResponse, workId, manager: EntityManager) {
    const [work, alreadyViewed] = await Promise.all([
      this.workRepository.findOneBy({ id: workId }),
      this.workViewRepository.findOneBy({
        userId: user.id,
        workId,
      }),
    ]);

    if (!work) {
      throw new NotFoundException('work not exits');
    }

    if (work.brandId != user.activeRole.brandId) throw new BusinessException();

    if (work.visibility != 1) {
      throw new BusinessException(WORK_MESSAGES.WORK_NOT_PUBLISHED);
    }

    if (alreadyViewed) {
      throw new ConflictException('already viewed');
    }

    // add view
    const workView = this.workViewRepository.create({ workId, userId: user.id });

    // update count
    work.viewCount = work.viewCount + 1;

    await Promise.all([manager.save(workView), manager.save(work)]);
  }

  async addLike(user: DefaultUserResponse, workId, manager: EntityManager) {
    const [work, alreadyLiked] = await Promise.all([
      this.workRepository.findOneBy({ id: workId }),
      this.workLikeRepository.findOneBy({
        userId: user.id,
        workId,
      }),
    ]);

    if (!work) {
      throw new NotFoundException('work not exits');
    }

    if (work.brandId != user.activeRole.brandId) throw new BusinessException();

    if (work.visibility != 1) {
      throw new BusinessException(WORK_MESSAGES.WORK_NOT_PUBLISHED);
    }

    if (alreadyLiked) {
      throw new ConflictException('already liked');
    }

    // add like
    const workView = this.workLikeRepository.create({ workId, userId: user.id });

    // update like count
    work.likeCount = work.likeCount + 1;

    await Promise.all([manager.save(workView), manager.save(work)]);
  }

  async unLike(user: DefaultUserResponse, workId, manager: EntityManager) {
    const [work, alreadyLiked] = await Promise.all([
      this.workRepository.findOneBy({ id: workId }),
      this.workLikeRepository.findOneBy({
        userId: user.id,
        workId,
      }),
    ]);

    if (!work) {
      throw new NotFoundException('work not exits');
    }

    if (!alreadyLiked) {
      throw new ConflictException('not already liked');
    }

    // update like count
    work.likeCount = work.likeCount - 1;

    await Promise.all([
      // delete like
      manager.delete(WorkLike, alreadyLiked.id),
      manager.save(work),
    ]);
  }

  async addComment(
    user: DefaultUserResponse,
    workId: number,
    commentWorkDto: AddCommentDto,
    manager: EntityManager,
  ) {
    const masterWorkCommentId = commentWorkDto.masterWorkCommentId;
    const work = await this.workRepository.findOneBy({ id: workId });

    if (!work) {
      throw new NotFoundException('work not exits');
    }

    if (work.brandId != user.activeRole.brandId) throw new BusinessException();

    if (work.visibility != 1) {
      throw new BusinessException(WORK_MESSAGES.WORK_NOT_PUBLISHED);
    }

    const workComment = this.workCommentRepository.create({
      workId: workId,
      userId: user.id,
      masterCommentId: masterWorkCommentId,
    });

    // updating comment count in work
    work.commentCount = work.commentCount + 1;

    await Promise.all([manager.save(workComment), manager.save(work)]);
  }

  async deleteComment(
    user: DefaultUserResponse,
    commentId: number,
    manager: EntityManager,
  ) {
    const comment = await this.workCommentRepository.findOneBy({ id: commentId });

    if (user.id != comment.userId) {
      throw new UnauthorizedException('Invalid User');
    }
    if (!comment) {
      throw new NotFoundException('comment not exits');
    }
    const work = await this.workRepository.findOneBy({ id: comment.workId });

    // updating comment count in work
    work.commentCount = work.commentCount - 1;

    await Promise.all([manager.delete(WorkComment, commentId), manager.save(work)]);
  }

  async getComments(user: DefaultUserResponse, workId, queryParams: any) {
    const work = await this.workRepository.findOneBy({ id: workId });

    if (!work) {
      throw new NotFoundException('work not exits');
    }

    if (work.brandId != user.activeRole.brandId) throw new BusinessException();

    if (work.visibility != 1) {
      throw new BusinessException(WORK_MESSAGES.WORK_NOT_PUBLISHED);
    }

    const queryBuilderInstance =
      this.workCommentRepository.createQueryBuilder('workComment');
    const queryBuilder = filterQueryBuilder({
      queryParams,
      queryBuilder: queryBuilderInstance,
      filters: queryParams.filter,
    });

    queryBuilder.innerJoinAndSelect('workComment.masterComment', 'master_work_comment');
    queryBuilder.innerJoinAndSelect('workComment.user', 'user');
    queryBuilder
      .innerJoinAndSelect('user.profile', 'profile')
      .where('workComment.workId = :workId', { workId });

    queryBuilder.select([
      'workComment',
      'master_work_comment',
      'user.id',
      'profile.firstName',
      'profile.lastName',
      'profile.profileImage',
    ]);

    let [comments, count] = await queryBuilder.getManyAndCount();

    const presignedUrlPromises = [];
    for (let comment of comments) {
      if (comment.user.profile.profileImage) {
        const commentProfileUrlPromise = this.fileUploadService
          .generateGetObjectPresignedUrl(comment.user.profile.profileImage)
          .then((url) => {
            comment.user.profile.profileImage = url;
          });
        presignedUrlPromises.push(commentProfileUrlPromise);
      }
    }
    await Promise.all(presignedUrlPromises);

    return { comments, count };
  }
}
