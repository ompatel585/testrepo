import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateCentreWallDto {
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
  centerMedia?: boolean | string[];

  @IsString()
  cheerChant: string;
}
