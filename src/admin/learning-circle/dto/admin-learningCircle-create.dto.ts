import {
  IsNumber,
  IsString,
  IsOptional,
  ValidateNested,
  ArrayNotEmpty,
  IsNotEmpty,
  IsEnum,
  IsIn,
  IsArray,
  Matches,
  ValidateIf,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { AdminCreateLearningCircleMappingDto } from './admin-learningCircle-mapping-create.dto';
import { IsExist } from 'src/common/validation/isExists';
import { AccountTypeEnum } from 'src/common/entities/taxonomyBrand.entity';
import { PublishingOption } from 'src/common/entities/learningCircle.entity';
import { IsExistInArray } from 'src/common/validation/isExistInArray.constrain';

export enum LearningCircleTypeEnum {
  VIDEO = 'VIDEO',
  CONTENT = 'CONTENT'
}

export class AdminCreateLearningCircleDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsEnum(LearningCircleTypeEnum)
  type: LearningCircleTypeEnum;

  @IsOptional()
  @IsString()
  link: string;

  @IsNotEmpty()
  @IsExist({ tableName: 'learning_circle_type', column: 'id' })
  @IsNumber()
  learningCircleTypeId: number;

  @IsOptional()
  @IsArray()
  // @ValidateNested({ each: true })
  // @IsExistInArray({
  //   tables: [
  //     {
  //       tableName: 'course_module',
  //       columns: ['id'],
  //     },
  //   ],
  // })
  @IsString({ each: true })
  @Matches(/^\d+$/, { each: true, message: 'Each bookId tag must be numeric.' })
  bookIdTags: string[];

  @IsOptional()
  @IsString()
  @Matches(/\.(pdf|txt)$/i, {
    message: 'content file should be in .pdf|.txt formats',
  })
  contentFile: string;

  @ValidateIf(o => 
    o.type === LearningCircleTypeEnum.VIDEO && !o.videoLink
  )
  @IsNotEmpty()
  @IsString()
  @Matches(/\.(mp4|avi|mkv')$/i, {
    message: 'video file should be in .mp4, .avi or .mkv  formats',
  })
  video: string;

  @ValidateIf(o => 
    o.type === LearningCircleTypeEnum.VIDEO && !o.video
  )
  @IsNotEmpty()
  @IsString()
  videoLink: string;

  @IsOptional()
  @IsString()
  @Matches(/\.(jpg|jpeg|png|gif|webp')$/i, {
    message: 'thumbnail should be in .jpg, jpeg, .png, .gif or .webp formats',
  })
  thumbnail: string;

  @IsOptional()
  @IsArray()
  @IsEnum(PublishingOption, { each: true })
  publishingOptions: PublishingOption[];

  @IsOptional()
  @IsIn([0, 1])
  commentPermission: number;

  @ValidateNested({ each: true })
  @IsExistInArray({
    tables: [
      {
        tableName: 'taxonomy_brand_category',
        columns: ['id', 'taxonomyBrandId'],
        columnMapping: {
          taxonomyBrandCategoryId: 'id',
          taxonomyBrandId: 'taxonomyBrandId',
        },
      },
    ],
  })
  @Type(() => AdminCreateLearningCircleMappingDto)
  @ArrayNotEmpty({ message: 'select at least 1 brand category' })
  learningCircleMappings: AdminCreateLearningCircleMappingDto[];
}
