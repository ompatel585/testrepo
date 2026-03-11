import { IsNumber, IsString, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class SubParameterDto {
  @IsOptional()
  @IsNumber()
  brandId?: number;

  @IsOptional()
  @IsNumber()
  infrastructureCategoryId?: number;

  @IsOptional()
  @IsString()
  infrastructureParameterName?: string;

  @IsString()
  name: string;

  @IsString()
  type: string;

  @IsOptional()
  createdAt?: Date;

  @IsOptional()
  updatedAt?: Date;
}

export class CreateInfrastructureParameterDto {
  @IsOptional()
  @IsNumber()
  brandId?: number;

  @IsOptional()
  @IsNumber()
  categoryId?: number;

  @IsOptional()
  @IsString()
  parameterName?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubParameterDto)
  subParameters: SubParameterDto[];
}

