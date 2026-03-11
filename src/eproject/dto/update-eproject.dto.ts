import { IsDateString, IsIn, IsOptional } from 'class-validator';

export class UpdateEprojectDto {
  @IsOptional()
  @IsDateString()
  eprojectStartDate: string;

  @IsOptional()
  @IsDateString()
  submissionDate: string;

  @IsOptional()
  @IsDateString()
  dueDate: string;

  @IsOptional()
  @IsIn([0, 1])
  isCancelled: number;
}
