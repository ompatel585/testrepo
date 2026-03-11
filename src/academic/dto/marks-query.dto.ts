import { Transform, Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { QueryParamsDto } from 'src/common/dto/query-params.dto';

// enum SortByEnum {
//   ID = 'id',
// }

export class MarkQueryFilterDto {
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  id: number;
}

export class MarksQueryDto {
  @ValidateNested()
  @Type(() => MarkQueryFilterDto)
  filter: MarkQueryFilterDto;

  // @IsOptional()
  // @IsEnum(SortByEnum)
  // sortBy: SortByEnum = SortByEnum.ID;
}
