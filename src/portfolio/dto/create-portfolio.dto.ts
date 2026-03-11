import {
  IsArray,
  IsString,
  IsInt,
  IsOptional,
  IsNumber,
  IsIn,
  IsNotEmpty,
} from 'class-validator';

export class CreatePortfolioDto {
  @IsArray()
  @IsInt({ each: true })
  workIds: number[];

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsNumber()
  @IsIn([0, 1])
  visibility: number = 0;

  @IsNotEmpty()
  @IsString()
  thumbnail: string;

  @IsOptional()
  @IsString()
  reelLink: string;
}
