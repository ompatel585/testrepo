import { IsEnum, IsOptional } from 'class-validator';
import { QueryParamsDto } from 'src/common/dto/query-params.dto';

enum SortByEnum {
  ID = 'id',
}

export class CityQueryDto extends QueryParamsDto {
  @IsOptional()
  @IsEnum(SortByEnum)
  sortBy: SortByEnum = SortByEnum.ID;
}
