import { IsNumber } from 'class-validator';

export class CategoryConfigDto {
  @IsNumber()
  winner: number;

  @IsNumber()
  runnerUp: number;
}
