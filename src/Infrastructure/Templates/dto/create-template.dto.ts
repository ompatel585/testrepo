import { IsString, IsNumber, IsArray, IsEnum } from 'class-validator';

export class ParameterDto {
  id: number;
  subParameters: number[];
}

export enum TemplateStatus {
  PUBLISH = 'publish',
  DRAFT = 'draft',
  DELETE = 'delete',
}

export class CreateTemplateDto {

  @IsString()
  name: string;

  @IsNumber()
  brandId: number;

  @IsArray()
  parameters: ParameterDto[];

  @IsEnum(['publish','draft','delete'])
  status: 'publish' | 'draft' | 'delete';
}