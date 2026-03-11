import { IsIn, IsNotEmpty, IsString } from 'class-validator';
import { JobStatus } from 'src/common/entities/job.entity';

export class UpdateJobStatusDto {
  @IsNotEmpty()
  @IsString()
  @IsIn([JobStatus.Open, JobStatus.Closed])
  jobStatus: string;
}
