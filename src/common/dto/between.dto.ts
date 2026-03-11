import { IsOptional, IsDate, IsDateString } from 'class-validator';

export class BetweenDateDto {
  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;
}
