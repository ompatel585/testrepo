import { IsOptional, IsNumber, IsString, IsNumberString } from 'class-validator';
import { Type } from 'class-transformer';

export class FilterSubmissionDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  count?: number = 20;

  @IsOptional()
  @IsString()
  rating?: string;

  @IsOptional()
  @IsString()
  bucket?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  categoryId?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  eventId?: number;

  @IsOptional()
  @IsString()
  status: string;
}
