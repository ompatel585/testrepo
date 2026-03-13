import { IsNumber, IsString, IsDateString, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateReviewNominationDto {

  @Type(() => Number)
  @IsNumber()
  brandId: number;

  @Type(() => Number)
  @IsNumber()
  centerId: number;

  @Type(() => Number)
  @IsNumber()
  templateId: number;

  @IsString()
  reason: string;

  @IsDateString()
  dueDate: Date;

  @IsOptional()
  @IsString()
  note?: string;
}