import { Type } from 'class-transformer';
import { IsEnum, IsOptional, ValidateNested } from 'class-validator';
import { BetweenDateDto } from 'src/common/dto/between.dto';
import { QueryParamsDto } from 'src/common/dto/query-params.dto';

export enum DrmDownloadSortBY {
  ID = 'id',
}

export class DrmDownloadFilterDto {
  @IsOptional()
  userId: string;
}

export class DrmDownloadBetweenDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => BetweenDateDto)
  createdAt?: BetweenDateDto;
}

export class DrmDownloadQueryDto extends QueryParamsDto {
  @ValidateNested()
  @Type(() => DrmDownloadFilterDto)
  filter: DrmDownloadFilterDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => DrmDownloadBetweenDto)
  between?: DrmDownloadBetweenDto;

  @IsOptional()
  @IsEnum(DrmDownloadSortBY)
  sortBy: DrmDownloadSortBY = DrmDownloadSortBY.ID;
}
