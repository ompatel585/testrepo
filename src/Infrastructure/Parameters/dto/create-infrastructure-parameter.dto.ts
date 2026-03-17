import {
  IsNumber,
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class SubParameterDto {

  @IsString()
  name: string;

  @IsString()
  type: string;
}

export class CreateInfrastructureParameterDto {


  @Type(() => Number)
  @IsNumber()
  brandId?: number;

  @Type(() => Number)
  @IsNumber()
  categoryId: number;

  @IsString()
  parameterName: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubParameterDto)
  subParameters: SubParameterDto[];
}

export class UpdateInfrastructureParameterDto {

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  brandId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  categoryId?: number;

  @IsOptional()
  @IsString()
  parameterName?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubParameterDto)
  subParameters?: SubParameterDto[];
}