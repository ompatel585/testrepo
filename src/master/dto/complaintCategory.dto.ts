import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  ValidateNested,
  IsDefined,
} from 'class-validator';
import { IsAlreadyExist } from 'src/common/validation/isAlreadyExists';

export class ComplaintCategoryQueryFilterDto {
  @IsNotEmpty()
  @IsString()
  type: string;
}

export class ComplaintCategoryDto {
  @ValidateNested()
  @Type(() => ComplaintCategoryQueryFilterDto)
  filter: ComplaintCategoryQueryFilterDto;

  @IsNotEmpty()
  @IsString()
  category: string;

  @IsNotEmpty()
  @IsString()
  type: string;

  @IsOptional()
  @IsNumber()
  userId: number;
}
