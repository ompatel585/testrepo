import { IsIn, IsNotEmpty, IsString, ValidateIf } from 'class-validator';
import { WorkStatus } from 'src/common/enum/work-status.enum';

export class WorkStatusDto {
  @IsNotEmpty()
  @IsString()
  @IsIn([WorkStatus.Approved, WorkStatus.Rejected])
  status: string;

  @ValidateIf((object, value) => object.status === WorkStatus.Rejected)
  @IsNotEmpty()
  @IsString()
  feedback: string;
}
