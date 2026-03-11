import { Type } from 'class-transformer';
import { IsDate, IsIn, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateJobInterviewDto {
  @IsNotEmpty()
  @IsString()
  otherDetails: string;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  jobApplicationId: number;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  jobId: number;

  @IsNotEmpty()
  @IsString()
  contactNumber: string;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  studentId: number;

  @IsNotEmpty()
  @IsString()
  interviewDate: Date;
}
