import { Type } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';

export class FetchEmployeeBookDto {
  @IsOptional()
  @IsString()
  search: string;

  @IsOptional()
  @IsNotEmpty()
  @Type(() => Number)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(20)
  limit: number = 10;
}
