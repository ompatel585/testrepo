import {
  IsOptional,
  IsString,
  IsIn,
  IsEnum,
  ValidateNested,
  IsNumber,
  IsArray,
  Matches,
} from 'class-validator';
import { QueryParamsDto } from '../../common/dto/query-params.dto';
import { Transform, Type } from 'class-transformer';
import { stringToNumberArrayTransform } from 'src/common/transform/stringToNumberArray.transform';

export enum LearningCircleSortBY {
  ID = 'id',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
}
export class LearningCircleFilterDto {
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  learningCircleTypeId: number;

  @IsOptional()
  @IsIn([1])
  @IsNumber()
  isLearningCircleTypeActive: number = 1;

  @IsOptional()
  @IsIn([1])
  @IsNumber()
  isTaxonomyBrandCategoryActive: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  id: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  taxonomyBrandId: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  taxonomyBrandCategoryId: number;

  @IsOptional()
  @Matches(/^\d+$/, { message: 'bookCode should be a string of numbers only' })
  bookCode: string;
}

export class LearningCircleExclusionDto {
  @IsOptional()
  @Transform(({ value }) => stringToNumberArrayTransform(value))
  id: number[];
}

export class LearningCircleQueryDto extends QueryParamsDto {
  @ValidateNested()
  @Type(() => LearningCircleFilterDto)
  filter: LearningCircleFilterDto;

  @ValidateNested()
  @Type(() => LearningCircleExclusionDto)
  exclusion: LearningCircleExclusionDto;

  @IsOptional()
  @IsEnum(LearningCircleSortBY)
  sortBy: LearningCircleSortBY = LearningCircleSortBY.ID;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  subBrandId: number;
}
