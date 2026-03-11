import { Optional } from '@nestjs/common';
import { Type } from 'class-transformer';
import { IsEnum, IsOptional, ValidateNested } from 'class-validator';
import { QueryParamsDto } from 'src/common/dto/query-params.dto';

export enum EprojectListSortBY {
  ID = 'id',
}

export class EprojectListFilterDto {
  @Optional()
  studentKey: string;
}

export class EprojectListQueryDto extends QueryParamsDto {
  @ValidateNested()
  @Type(() => EprojectListFilterDto)
  filter: EprojectListFilterDto;

  @IsOptional()
  @IsEnum(EprojectListSortBY)
  sortBy: EprojectListSortBY = EprojectListSortBY.ID;
}
