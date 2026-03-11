import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';
import { SubmissionStatus } from 'src/common/entities/eventSubmission.entity';

export class UpdateSubmissionStatusDto {
  @IsNumber()
  @IsNotEmpty()
  submissionId: number;

  @IsEnum(SubmissionStatus)
  @IsNotEmpty()
  status: SubmissionStatus;
}