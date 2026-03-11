import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Work } from 'src/common/entities/work.entity';
import { filterQueryBuilder } from 'src/common/helper/query.helper';
import { Repository } from 'typeorm';
import { FeedFilterDto, FeedQueryDto } from './dto/feed-query.dto';
import { FileUploadService } from 'src/file-upload/file-upload.service';
import { DefaultUserResponse } from 'src/common/strategy/jwt.strategy';

@Injectable()
export class FeedService {
  constructor(
    @InjectRepository(Work)
    private workRepository: Repository<Work>,
    private fileUploadService: FileUploadService,
  ) {}

  async getFeed(
    user: DefaultUserResponse,
    queryParams: FeedQueryDto,
    searchKeys?: string[],
  ) {
    let baseFilter = new FeedFilterDto();

    const baseWorkQuery = this.workRepository.createQueryBuilder('work');
    baseFilter = { visibility: 1, brandId: user.activeRole.brandId };
    const baseExclusion = { userId: user.id };
    const baseQueryBuilder = filterQueryBuilder({
      queryParams,
      queryBuilder: baseWorkQuery,
      filters: baseFilter,
      exclusions: baseExclusion,
      searchKeys: searchKeys,
      hasMore: true,
    });

    baseQueryBuilder.select(['work.id', 'work.userId', 'work.createdAt']);

    const subQueryBuilder = this.workRepository
      .createQueryBuilder('work')
      .innerJoin(
        `(${baseWorkQuery.getQuery()})`,
        'filtered_work',
        '"filtered_work"."work_id" = "work"."id"',
      )
      .setParameters(baseWorkQuery.getParameters());

    queryParams.page = 1;
    queryParams.filter = {};
    const queryBuilder = filterQueryBuilder({
      queryParams,
      queryBuilder: subQueryBuilder,
      filters: queryParams.filter,
      hasMore: true,
    });

    /**
     * added common join of work.user on work.userId before cloning the query-builder
     */
    queryBuilder.innerJoinAndSelect('work.user', 'user');

    queryBuilder.leftJoinAndSelect('work.files', 'files');
    queryBuilder.leftJoinAndSelect(
      'work.workLike',
      'work_like',
      'work_like.userId = :workUserId',
      { workUserId: user.id },
    );
    queryBuilder.innerJoinAndSelect('user.profile', 'profile');
    queryBuilder.select([
      'work.id',
      'work.title',
      'work.description',
      'work.categoryId',
      'work.tags',
      'work.thumbnail',
      'work.createdAt',
      'work.subCategoryId',
      'work.viewCount',
      'work.likeCount',
      'work.commentCount',
      'work_like',
      'files.id',
      'files.filePath',
      'files.fileType',
      'user.id',
      'profile.firstName',
      'profile.middleName',
      'profile.lastName',
      'profile.profileImage',
    ]);

    const records = await queryBuilder.getMany();

    const nextPage = queryParams.limit != -1 ? records.length > queryParams.limit : false;
    const works = nextPage ? records.slice(0, -1) : records;

    const presignedUrlPromises = [];

    for (const work of works) {
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

      if (work.user.profile.profileImage) {
        const profileImageUrlPromise = this.fileUploadService
          .generateGetObjectPresignedUrl(work.user.profile.profileImage)
          .then((url) => {
            work.user.profile.profileImage = url;
          });
        presignedUrlPromises.push(profileImageUrlPromise);
      }

      for (const file of work.files) {
        const filePath = file.compressedFilePath
          ? file.compressedFilePath
          : file.filePath;

        if (filePath) {
          const filePathUrlPromise = this.fileUploadService
            .generateGetObjectPresignedUrl(filePath)
            .then((url) => {
              file.filePath = url;
            });
          presignedUrlPromises.push(filePathUrlPromise);
        }
      }
    }

    await Promise.all(presignedUrlPromises);

    const newWorks = works.map((work) => {
      const { workLike, ...newWork } = work;
      newWork.user['isLiked'] = workLike.length > 0;
      return newWork;
    });

    return { newWorks, nextPage };
  }
}
