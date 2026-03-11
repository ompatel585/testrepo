import { Type } from 'class-transformer';
import { IsEnum, IsOptional, ValidateNested } from 'class-validator';
import { QueryParamsDto } from 'src/common/dto/query-params.dto';

export enum DrmSortBY {
  ID = 'id',
}

export class DrmFilterDto {}

export class DrmQueryDto extends QueryParamsDto {
  @ValidateNested()
  @Type(() => DrmFilterDto)
  filter: DrmFilterDto;

  @IsOptional()
  @IsEnum(DrmSortBY)
  sortBy: DrmSortBY = DrmSortBY.ID;
}
