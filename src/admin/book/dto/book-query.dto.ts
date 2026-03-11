import { Transform, Type } from 'class-transformer';
import { IsEnum, IsIn, IsOptional, ValidateNested } from 'class-validator';
import { QueryParamsDto } from 'src/common/dto/query-params.dto';
import { stringToNumberArrayTransform } from 'src/common/transform/stringToNumberArray.transform';

export enum BookSortBY {
  ID = 'id',
}

export class BookFilterDto {
  @IsOptional()
  @Transform(({ value }) => stringToNumberArrayTransform(value))
  aptrack1SubBrandKeys: number[];

  @IsOptional()
  @IsIn([1])
  isActive: number = 1;

  @IsOptional()
  @Transform(({ value }) => stringToNumberArrayTransform(value))
  aptrack2SubBrandKeys: number[];
}

export class BookQueryDto extends QueryParamsDto {
  @ValidateNested()
  @Type(() => BookFilterDto)
  filter: BookFilterDto;

  @IsOptional()
  @IsEnum(BookSortBY)
  sortBy: BookSortBY = BookSortBY.ID;
}
