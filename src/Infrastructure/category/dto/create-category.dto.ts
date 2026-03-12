import { IsOptional, IsString, IsNumber } from 'class-validator';

export class CreateCategoryDto {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @IsNumber()
  brandId?: number;
}