import { Transform, Type } from 'class-transformer';
import { IsEnum, IsIn, IsOptional, ValidateNested } from 'class-validator';
import { QueryParamsDto } from 'src/common/dto/query-params.dto';

export enum WorkCategorySortBY {
  ID = 'id',
}

export class WorkCategoryFilterDto {
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  brandId: number;

  @IsOptional()
  @IsIn([0, 1])
  status: number;
}

export class WorkCategoryQueryDto extends QueryParamsDto {
  @ValidateNested()
  @Type(() => WorkCategoryFilterDto)
  filter: WorkCategoryFilterDto;

  @IsOptional()
  @IsEnum(WorkCategorySortBY)
  sortBy: WorkCategorySortBY = WorkCategorySortBY.ID;
}
