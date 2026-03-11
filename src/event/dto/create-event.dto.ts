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

class CategoriesDto {
  @IsArray()
  @IsNumber({}, { each: true })
  @Type(() => Number)
  domestic: number[];

  @IsArray()
  @IsNumber({}, { each: true })
  @Type(() => Number)
  international: number[];
}

class AssetsDto {
  @IsString()
  bannerPath: string;

  @IsString()
  ruleBookPath: string;

  @IsString()
  evaluationCriteriaPath: string;
}

export class CreateEventDto {
  @IsArray()
  @IsNumber({}, { each: true })
  @Type(() => Number)
  country: number[];

  @IsNumber()
  @Type(() => Number)
  brandId: number;

  @IsString()
  eventName: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @ValidateNested()
  @Type(() => CategoriesDto)
  categories: CategoriesDto;

  @IsString()
  description: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  guidelines?: string[];

  @ValidateNested()
  @Type(() => AssetsDto)
  assets: AssetsDto;

  @IsEnum(EventStatus)
  @IsOptional()
  eventStatus?: EventStatus = EventStatus.ACTIVE;

  @IsEnum(WildCardStatus)
  @IsOptional()
  wildCard?: WildCardStatus = WildCardStatus.DISABLED;

  @IsOptional()
  @IsObject()
  categoryConfig?: {
    [key: string]: CategoryConfigDto;
  };
}
