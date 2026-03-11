import { IsNotEmpty, IsNumber, IsOptional, IsString, IsArray } from 'class-validator';

export class UpdateCentreWallDto {
  @IsNumber()
  centerId: number;

  @IsNumber()
  eventId: number;

  @IsOptional()
  @IsString()
  centerLogo?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  centerMedia?: string[];

  @IsOptional()
  @IsString()
  cheerChant?: string;
}
