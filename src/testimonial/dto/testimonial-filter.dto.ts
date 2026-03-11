import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { QueryParamsDto } from '../../common/dto/query-params.dto';
import { Transform, Type } from 'class-transformer';

export enum TestimonialSortBY {
  ID = 'id',
  CREATED_AT = 'created_at',
}

export class TestimonialFilterDto {
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  userId: number;

  @IsOptional()
  @IsNotEmpty()
  @IsNumber()
  brandId: number;
}

export class TestimonialQueryDto extends QueryParamsDto {
  @ValidateNested()
  @Type(() => TestimonialFilterDto)
  filter: TestimonialFilterDto;

  @IsOptional()
  @IsEnum(TestimonialSortBY)
  sortBy: TestimonialSortBY = TestimonialSortBY.ID;
}
