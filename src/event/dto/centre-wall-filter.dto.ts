import { IsOptional, IsString } from 'class-validator';
import { QueryParamsDto } from 'src/common/dto/query-params.dto';

export class CenterDashboardFilterDto extends QueryParamsDto {
  @IsOptional()
  submissionStatus?: string;

  @IsOptional()
  @IsString()
  category?: string;
}
