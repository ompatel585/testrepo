import {
  IsString,
  IsArray,
  IsNumber,
  IsOptional,
  IsDateString,
  ValidateNested,
  IsEnum,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EventStatus, WildCardStatus } from 'src/common/entities/event.entity';
import { CategoryConfigDto } from './categoryConfig.dto';

class UpdateCategoriesDto {
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  @Type(() => Number)
  domestic?: number[];

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  @Type(() => Number)
  international?: number[];
}

class UpdateAssetsDto {
  @IsOptional()
  @IsString()
  bannerPath?: string;

  @IsOptional()
  @IsString()
  ruleBookPath?: string;

  @IsOptional()
  @IsString()
  evaluationCriteriaPath?: string;
}

export class UpdateEventDto {
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  @Type(() => Number)
  country?: number[];

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  brandId?: number;

  @IsOptional()
  @IsString()
  eventName?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateCategoriesDto)
  categories?: UpdateCategoriesDto;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  guidelines?: string[];

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateAssetsDto)
  assets?: UpdateAssetsDto;

  @IsOptional()
  @IsEnum(EventStatus)
  eventStatus?: EventStatus;

  @IsOptional()
  @IsEnum(WildCardStatus)
  wildCard?: WildCardStatus;

  @IsOptional()
  @IsObject()
  categoryConfig?: {
    [key: string]: CategoryConfigDto;
  };
}
