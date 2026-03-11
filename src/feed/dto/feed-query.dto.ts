import { Transform, Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, Max, Min, ValidateNested } from 'class-validator';
import { QueryParamsDto } from 'src/common/dto/query-params.dto';

export enum FeedSortBY {
  ID = 'id',
  WORK_CREATED_AT = 'work.createdAt',
  WORK_LIKE_COUNT = 'work.likeCount',
}

export class FeedFilterDto {}

export class FeedExclusionDto {}
export class FeedQueryDto extends QueryParamsDto {
  @ValidateNested()
  @Type(() => FeedFilterDto)
  filter: FeedFilterDto;

  @ValidateNested()
  @Type(() => FeedFilterDto)
  exclusion: FeedFilterDto;

  @IsOptional()
  @IsEnum(FeedSortBY)
  sortBy: FeedSortBY = FeedSortBY.WORK_CREATED_AT;

  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(20)
  limit: number = 10;
}
