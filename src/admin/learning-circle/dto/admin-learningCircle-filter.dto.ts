import {
  IsOptional,
  IsEnum,
  ValidateNested,
  IsNumber,
  Matches,
  IsIn,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { QueryParamsDto } from 'src/common/dto/query-params.dto';
import { stringToNumberArrayTransform } from 'src/common/transform/stringToNumberArray.transform';

export enum AdminLearningCircleSortBY {
  ID = 'id',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
}

export class AdminLearningCircleFilterDto {
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

  @IsOptional()
  @Transform(({ value }) => stringToNumberArrayTransform(value))
  brandId: number[];
}

export class AdminLearningCircleQueryDto extends QueryParamsDto {
  @ValidateNested()
  @Type(() => AdminLearningCircleFilterDto)
  filter: AdminLearningCircleFilterDto;

  @IsOptional()
  @IsEnum(AdminLearningCircleSortBY)
  sortBy: AdminLearningCircleSortBY = AdminLearningCircleSortBY.ID;
}
