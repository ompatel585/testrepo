import { IsBoolean, IsNotEmpty, IsNumber, IsString, Max, Min } from 'class-validator';

export class CreateEventWinnerDto {

  @IsNotEmpty()
  @IsNumber()
  categoryId: number;

  @IsNotEmpty()
  @IsNumber()
  ratingId: number;

  @IsNotEmpty()
  @IsNumber()
  submissionId: number;

  @IsNotEmpty()
  @IsString()
  studentId: string;

  @IsNumber()
  @IsNotEmpty()
  eventId: number;

  @IsNumber()
  @Min(0)
  @Max(1)
  winner: number;

  @IsNumber()
  @Min(0)
  @Max(1)
  runnerUp: number;
}
