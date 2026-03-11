import { Type } from 'class-transformer';
import { IsEnum, IsOptional, ValidateNested } from 'class-validator';
import { QueryParamsDto } from 'src/common/dto/query-params.dto';

export enum BookListSortBY {
  ID = 'id',
}

export class BookListFilterDto {}

export class BookListQueryDto extends QueryParamsDto {
  @ValidateNested()
  @Type(() => BookListFilterDto)
  filter: BookListFilterDto;

  @IsOptional()
  @IsEnum(BookListSortBY)
  sortBy: BookListSortBY = BookListSortBY.ID;
}
