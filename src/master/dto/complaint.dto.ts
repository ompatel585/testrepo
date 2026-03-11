import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  ValidateNested,
  IsIn,
} from 'class-validator';

export class ComplaintQueryFilterDto {
  @IsNotEmpty()
  @IsString()
  type: string;
}

export class ComplaintDto {
  @ValidateNested()
  @Type(() => ComplaintQueryFilterDto)
  filter: ComplaintQueryFilterDto;

  @IsNotEmpty()
  @IsNumber()
  userId: number;

  @IsNotEmpty()
  @IsString()
  userName: string;

  @IsNotEmpty()
  @IsString()
  userMobile: string;

  @IsNotEmpty()
  @IsString()
  userEmail: string;

  @IsNotEmpty()
  @IsString()
  userBrand: string;

  @IsNotEmpty()
  @IsString()
  userZone: string;

  @IsNotEmpty()
  @IsString()
  userRegion: string;

  @IsNotEmpty()
  @IsString()
  userArea: string;

  @IsNotEmpty()
  @IsString()
  userCenter: string;

  @IsNotEmpty()
  @IsNumber()
  complaintCategoryId: number;

  @IsNotEmpty()
  @IsString()
  complaintType: string;

  @IsOptional()
  @IsString()
  complaintDescription: string;

  @IsOptional()
  @IsIn([0, 1])
  @IsNumber()
  @Type(() => Number)
  isResolved: number;
}
