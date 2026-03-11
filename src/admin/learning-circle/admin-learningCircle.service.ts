import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { filterQueryBuilder } from 'src/common/helper/query.helper';
import { LearningCircle } from 'src/common/entities/learningCircle.entity';
import {
  AdminLearningCircleFilterDto,
  AdminLearningCircleQueryDto,
} from './dto/admin-learningCircle-filter.dto';
import { AdminLearningCircleUpdateDto } from './dto/admin-learningCircle-update.dto';
import { User } from 'src/common/entities/user.entity';
import { FileUploadService } from 'src/file-upload/file-upload.service';
import { S3_LEARNING_CIRCLE } from 'src/common/constants';
import { AdminCreateLearningCircleDto } from './dto/admin-learningCircle-create.dto';
import { AccountTypeEnum, TaxonomyBrand } from 'src/common/entities/taxonomyBrand.entity';
import { TaxonomyBrandCategory } from 'src/common/entities/taxonomyBrandCategory.entity';
import { TaxonomyMapping } from 'src/common/entities/taxonomyMapping.entity';
import { transformFilterKeysWithTableContext } from 'src/common/helper/transformFilterKeysWithTableContext.helper';
import { AdminLearningCircleUpdateContentFileDto } from './dto/admin-learningCircle-update-contentFile.dto';
import { AdminLearningCircleUpdateVideoFileDto } from './dto/admin-learningCircle-update-videoFile.dto';
import { AdminLearningCircleUpdateThumbnailFileDto } from './dto/admin-learningCircle-update-thumbnail.dto';
import { LearningCircleQueryDto } from 'src/learning-circle/dto/learningCircle-filter.dto';
import { UsersService } from 'src/users/users.service';
import { PermissionException } from 'src/common/exceptions/permission.exception';
import { TaxonomyBrandQueryDto } from './dto/taxonomybrand-query.dto';
import { UserRole } from 'src/common/entities/userRole.entity';

@Injectable()
export class AdminLearningCircleService {
  constructor(
    @InjectRepository(LearningCircle)
    private learningCircleRepository: Repository<LearningCircle>,

    @InjectRepository(TaxonomyBrand)
    private taxonomyBrandRepository: Repository<TaxonomyBrand>,

    @InjectRepository(TaxonomyMapping)
    private taxonomyMappingRepository: Repository<TaxonomyMapping>,

    private readonly fileUploadService: FileUploadService,
    private readonly userService: UsersService,
  ) {}
  async getLearningCircleData(
    queryParams: AdminLearningCircleQueryDto | LearningCircleQueryDto,
    searchKeys: string[],
  ) {
    /**
     * mapping of query filter keys which need table name as prefix
     */
    const filterMappings = {
      isLearningCircleTypeActive: 'learningCircleType.isActive',
      taxonomyBrandId: 'taxonomyBrandCategory.taxonomyBrandId',
      taxonomyBrandCategoryId: 'taxonomyBrandCategory.id',
      isTaxonomyBrandCategoryActive: 'taxonomyBrandCategory.isActive',
      bookCode: 'learning_circle.bookIdTags',
      brandId: 'taxonomyBrand.brandId',
    };
    /**
     * columnTypes is to determine if the filter is applied on a scalar or an array column
     * This helps to apply where clause with contains condition
     */
    const columnTypes = { 'learning_circle.bookIdTags': 'array' };

    queryParams.filter = transformFilterKeysWithTableContext(queryParams, filterMappings);

    const queryBuilderInstance =
      this.learningCircleRepository.createQueryBuilder('learning_circle');
    let exclusionFilter = null;
    if (queryParams instanceof LearningCircleQueryDto) {
      exclusionFilter = queryParams.exclusion;
    }

    const queryBuilder = filterQueryBuilder({
      queryParams: queryParams,
      queryBuilder: queryBuilderInstance,
      filters: queryParams.filter,
      searchKeys: searchKeys,
      exclusions: exclusionFilter,
      columnTypes: columnTypes,
    });

    queryBuilder
      .leftJoinAndSelect('learning_circle.learningCircleType', 'learningCircleType')
      .leftJoinAndSelect('learning_circle.taxonomyMapping', 'taxonomyMapping')
      .leftJoinAndSelect('taxonomyMapping.taxonomyBrand', 'taxonomyBrand')
      .leftJoinAndSelect('taxonomyMapping.taxonomyBrandCategory', 'taxonomyBrandCategory')
      .select([
        'learning_circle.id',
        'learning_circle.title',
        'learning_circle.description',
        'learning_circle.link',
        'learning_circle.video',
        'learning_circle.thumbnail',
        'learning_circle.videoLink',
        'learning_circle.contentFile',
        'learning_circle.createdAt',
        'learning_circle.updatedAt',
        'learningCircleType.id',
        'learningCircleType.name',
      ]);

    const [learningCircles, count] = await queryBuilder.getManyAndCount();

    return { learningCircles, count };
  }

  async getLearningCircleDetailById(learningCircleId: number) {
    const promises = [];

    const learningCircleItem = await this.learningCircleRepository.findOne({
      where: { id: learningCircleId },
      relations: [
        'learningCircleType',
        'taxonomyMapping.taxonomyBrand',
        'taxonomyMapping.taxonomyBrandCategory',
      ],
    });

    if (!learningCircleItem) {
      throw new NotFoundException();
    }

    return learningCircleItem;
  }

  async getTaxonomyBrands(queryParams: TaxonomyBrandQueryDto, searchKeys?: string[]) {
    const query = this.taxonomyBrandRepository.createQueryBuilder('taxonomy_brand');
    const queryBuilder = filterQueryBuilder({
      queryParams,
      queryBuilder: query,
      filters: queryParams.filter,
      searchKeys: searchKeys,
    });
    queryBuilder.innerJoinAndSelect(
      'taxonomy_brand.taxonomyBrandCategories',
      'taxonomy_brand_category',
    );

    const data = await queryBuilder.getMany();

    const groupedData = data.reduce(
      (acc, item) => {
        if (item.accountType === 'D') {
          acc.domestic.push(item);
        } else if (item.accountType === 'I') {
          acc.international.push(item);
        }
        return acc;
      },
      { domestic: [], international: [] },
    );
    return groupedData;
  }

  async patchLearningCircleItemById(
    updateLearningCircleItem: AdminLearningCircleUpdateDto,
    learningCircleId: number,
  ) {
    const { learningCircleMappings, ...learningCircleData } = updateLearningCircleItem;

    let learningCircle = await this.learningCircleRepository.findOne({
      where: { id: learningCircleId },
      relations: ['learningCircleType', 'taxonomyMapping'],
    });

    if (!learningCircle) {
      throw new NotFoundException();
    }

    // update learningCircle with req body properties
    Object.assign(learningCircle, learningCircleData);

    await this.learningCircleRepository.save({
      ...learningCircle,
      learningCircleType: { id: learningCircleData.learningCircleTypeId },
    });

    if (learningCircleMappings) {
      // remove all existing mappings
      await this.taxonomyMappingRepository.delete({
        learningCircleId: learningCircleId,
      });

      for (const mapping of learningCircleMappings) {
        // create new mappings
        const newMapping = this.taxonomyMappingRepository.create({
          taxonomyBrand: { id: mapping.taxonomyBrandId },
          taxonomyBrandCategory: { id: mapping.taxonomyBrandCategoryId },
          learningCircle: learningCircle,
        });

        await this.taxonomyMappingRepository.save(newMapping);
      }
    }
  }

  async updateLearningCircleContentFileById(
    contentFileDto: AdminLearningCircleUpdateContentFileDto,
    learningCircleId: number,
  ) {
    let learningCircle = await this.learningCircleRepository.findOne({
      where: { id: learningCircleId },
    });

    if (!learningCircle) {
      throw new NotFoundException();
    }

    let s3ContentFileKey = '';
    s3ContentFileKey = `${S3_LEARNING_CIRCLE}/${learningCircle.id}/${contentFileDto.contentFile}`;
    learningCircle.contentFile = s3ContentFileKey;
    learningCircle.contentFileName = contentFileDto.contentFile;

    await this.learningCircleRepository.save(learningCircle);

    let contentFile =
      await this.fileUploadService.generatePutObjectPresignedUrl(s3ContentFileKey);

    return { contentFile: contentFile.url, contentFileName: contentFileDto.contentFile };
  }

  async updateLearningCircleVideoFileById(
    videoFileDto: AdminLearningCircleUpdateVideoFileDto,
    learningCircleId: number,
  ) {
    let learningCircle = await this.learningCircleRepository.findOne({
      where: { id: learningCircleId },
    });

    if (!learningCircle) {
      throw new NotFoundException();
    }

    let s3VideoFileKey = '';
    s3VideoFileKey = `${S3_LEARNING_CIRCLE}/${learningCircle.id}/${videoFileDto.video}`;
    learningCircle.video = s3VideoFileKey;
    learningCircle.videoFileName = videoFileDto.video;

    await this.learningCircleRepository.save(learningCircle);

    let contentFile =
      await this.fileUploadService.generatePutObjectPresignedUrl(s3VideoFileKey);

    return { videoFile: contentFile.url, videoFileName: videoFileDto.video };
  }

  async updateLearningCircleThumbnailFileById(
    thumbnailFileDto: AdminLearningCircleUpdateThumbnailFileDto,
    learningCircleId: number,
  ) {
    let learningCircle = await this.learningCircleRepository.findOne({
      where: { id: learningCircleId },
    });

    if (!learningCircle) {
      throw new NotFoundException();
    }

    let s3ThumbnailFileKey = '';
    s3ThumbnailFileKey = `${S3_LEARNING_CIRCLE}/${learningCircle.id}/${thumbnailFileDto.thumbnail}`;
    learningCircle.thumbnail = s3ThumbnailFileKey;
    learningCircle.thumbnailFileName = thumbnailFileDto.thumbnail;

    await this.learningCircleRepository.save(learningCircle);

    let thumbnailFile =
      await this.fileUploadService.generatePutObjectPresignedUrl(s3ThumbnailFileKey);

    return {
      thumbnail: thumbnailFile.url,
      thumbnailFileName: thumbnailFileDto.thumbnail,
    };
  }

  async deleteLearningCircleContentFileById(learningCircleId: number) {
    let learningCircle = await this.learningCircleRepository.findOne({
      where: { id: learningCircleId },
    });

    if (!learningCircle) {
      throw new NotFoundException();
    }

    learningCircle.contentFile = null;
    learningCircle.contentFileName = null;
    await this.learningCircleRepository.save(learningCircle);
  }

  async deleteLearningCircleVideoFileById(learningCircleId: number) {
    let learningCircle = await this.learningCircleRepository.findOne({
      where: { id: learningCircleId },
    });

    if (!learningCircle) {
      throw new NotFoundException();
    }

    learningCircle.video = null;
    learningCircle.videoFileName = null;
    await this.learningCircleRepository.save(learningCircle);
  }

  async deleteLearningCircleVideoThumbnailFileById(learningCircleId: number) {
    let learningCircle = await this.learningCircleRepository.findOne({
      where: { id: learningCircleId },
    });

    if (!learningCircle) {
      throw new NotFoundException();
    }

    learningCircle.thumbnail = null;
    learningCircle.thumbnailFileName = null;
    await this.learningCircleRepository.save(learningCircle);
  }

  async deleteLearningCircleItemById(learningCircleId: number) {
    let learningCircleItem = await this.learningCircleRepository.findOne({
      where: { id: learningCircleId },
      relations: ['taxonomyMapping'],
    });

    if (!learningCircleItem) {
      throw new NotFoundException();
    }

    await this.taxonomyMappingRepository.delete({
      learningCircle: { id: learningCircleId },
    });

    return await this.learningCircleRepository.delete({ id: learningCircleId });
  }

  async createLearningCircleItem(createLearningCircleDto: AdminCreateLearningCircleDto) {
    const { learningCircleMappings, ...learningCircleData } = createLearningCircleDto;

    let learningCircle = this.learningCircleRepository.create({
      ...learningCircleData,
      videoFileName: learningCircleData?.video || null,
      thumbnailFileName: learningCircleData?.thumbnail || null,
      contentFileName: learningCircleData?.contentFile || null,
      learningCircleType: { id: learningCircleData.learningCircleTypeId },
    });

    learningCircle = await this.learningCircleRepository.save(learningCircle);

    // taxonomyMapping
    const mapping = learningCircleMappings.map((mapping) =>
      this.taxonomyMappingRepository.create({
        taxonomyBrand: { id: mapping.taxonomyBrandId },
        taxonomyBrandCategory: { id: mapping.taxonomyBrandCategoryId },
        learningCircle: learningCircle,
      }),
    );

    await this.taxonomyMappingRepository.save(mapping);

    let s3ContentFileKey = null;
    if (createLearningCircleDto.contentFile) {
      s3ContentFileKey = `${S3_LEARNING_CIRCLE}/${learningCircle.id}/${createLearningCircleDto.contentFile}`;
    }

    learningCircle.contentFile = s3ContentFileKey;

    let s3VideoFileKey = null;
    if (createLearningCircleDto.video) {
      s3VideoFileKey = `${S3_LEARNING_CIRCLE}/${learningCircle.id}/${createLearningCircleDto.video}`;
    }

    learningCircle.video = s3VideoFileKey;

    let s3ThumbnailFileKey = null;
    if (createLearningCircleDto.thumbnail) {
      s3ThumbnailFileKey = `${S3_LEARNING_CIRCLE}/${learningCircle.id}/${createLearningCircleDto.thumbnail}`;
    }

    learningCircle.thumbnail = s3ThumbnailFileKey;

    learningCircle = await this.learningCircleRepository.save(learningCircle);

    const promises = [];

    if (s3ContentFileKey) {
      promises.push(
        this.fileUploadService
          .generatePutObjectPresignedUrl(s3ContentFileKey)
          .then((item) => {
            learningCircle.contentFile = item.url;
          }),
      );
    }
    if (s3VideoFileKey) {
      promises.push(
        this.fileUploadService
          .generatePutObjectPresignedUrl(s3VideoFileKey)
          .then((item) => {
            learningCircle.video = item.url;
          }),
      );
    }
    if (s3ThumbnailFileKey) {
      promises.push(
        this.fileUploadService
          .generatePutObjectPresignedUrl(s3ThumbnailFileKey)
          .then((item) => {
            learningCircle.thumbnail = item.url;
          }),
      );
    }

    await Promise.all(promises);

    return learningCircle;
  }

  async validateSubBrandId(activeRole: UserRole, subBrandId: number) {
    if (!activeRole.subBrandIds.includes(subBrandId)) {
      throw new PermissionException();
    }

    return true;
  }
}
