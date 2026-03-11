import { Type } from 'class-transformer';
import { IsEnum, IsOptional, ValidateNested } from 'class-validator';
import { QueryParamsDto } from 'src/common/dto/query-params.dto';

export enum FollowSortBY {
  ID = 'id',
}

export class FollowFilterDto {}

export class FollowQueryDto extends QueryParamsDto {
  @ValidateNested()
  @Type(() => FollowFilterDto)
  filter: FollowFilterDto;

  @IsOptional()
  @IsEnum(FollowSortBY)
  sortBy: FollowSortBY = FollowSortBY.ID;
}
