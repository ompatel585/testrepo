import { IsNumber, IsString, IsOptional } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class AdminCreateLearningCircleMappingDto {
  @IsNumber()
  taxonomyBrandId: number;

  @IsNumber()
  taxonomyBrandCategoryId: number;
}
