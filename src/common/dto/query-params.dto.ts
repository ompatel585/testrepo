import { Type } from 'class-transformer';
import { IsOptional, IsIn, Min, Max, IsNotEmpty } from 'class-validator';

export class QueryParamsDto {
  @IsOptional()
  @IsNotEmpty()
  @IsIn(['ASC', 'DESC'])
  sortOrder: 'ASC' | 'DESC' = 'DESC';

  @IsOptional()
  search: string;

  @IsOptional()
  @IsNotEmpty()
  @Type(() => Number)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @Min(-1)
  @Max(100)
  limit: number = 10;
}
