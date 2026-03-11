import { Type } from 'class-transformer';
import { IsEnum, IsOptional, ValidateNested } from 'class-validator';
import { QueryParamsDto } from 'src/common/dto/query-params.dto';

export enum CommentSortBY {
  ID = 'id',
}

export class CommentFilterDto {}

export class CommentQueryDto extends QueryParamsDto {
  @ValidateNested()
  @Type(() => CommentFilterDto)
  filter: CommentFilterDto;

  @IsOptional()
  @IsEnum(CommentSortBY)
  sortBy: CommentSortBY = CommentSortBY.ID;
}
