import { IsOptional, IsNumber, IsString, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { QueryParamsDto } from 'src/common/dto/query-params.dto';

export class FilterEventRatingDto extends QueryParamsDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  eventId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  categoryId?: number;

  @IsOptional()
  @IsString()
  juryType?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  winner?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  runnerUp?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  wildcart?: number;

}
