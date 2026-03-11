import {
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
  validate,
} from 'class-validator';
import { QueryParamsDto } from '../../common/dto/query-params.dto';
import { Transform, Type } from 'class-transformer';
import { stringToNumberArrayTransform } from 'src/common/transform/stringToNumberArray.transform';

export enum JobSortBY {
  ID = 'id',
  CREATED_AT = 'createdAt',
  JOB_TITLE = 'jobTitle.name',
}

export class JobFilterDto {
  @IsOptional()
  @Transform(({ value }) => stringToNumberArrayTransform(value))
  id: number[];

  @IsOptional()
  @Type(() => String)
  status: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  brandId: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  companyId: number;

  @IsOptional()
  @Type(() => String)
  zone: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  cityId: number;
}

export class JobQueryDto extends QueryParamsDto {
  @ValidateNested()
  @Type(() => JobFilterDto)
  filter: JobFilterDto;

  @IsOptional()
  @IsEnum(JobSortBY)
  sortBy: JobSortBY = JobSortBY.ID;
}
