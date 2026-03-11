import { IsEnum, IsOptional } from 'class-validator';
import { QueryParamsDto } from 'src/common/dto/query-params.dto';

enum SortByEnum {
  ID = 'id',
}

export class NotificationQueryDto extends QueryParamsDto {
  @IsOptional()
  @IsEnum(SortByEnum)
  sortBy: SortByEnum = SortByEnum.ID;
}
