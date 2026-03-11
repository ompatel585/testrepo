import {
  IsInt,
  IsString,
  IsDateString,
  IsOptional,
  IsIn,
  IsNotEmpty,
} from 'class-validator';

export class AddEprojectDto {
  @IsString()
  @IsNotEmpty()
  studentKey: string;

  @IsString()
  @IsNotEmpty()
  eprojectExamCode: string;

  @IsString()
  @IsNotEmpty()
  centerDetails: string;

  @IsString()
  @IsNotEmpty()
  courseDetails: string;

  @IsString()
  @IsNotEmpty()
  term: string;

  @IsDateString()
  eprojectStartDate: string;

  @IsDateString()
  submissionDate: string;

  @IsDateString()
  dueDate: string;

  @IsIn([0, 1])
  isPk: number;
}
