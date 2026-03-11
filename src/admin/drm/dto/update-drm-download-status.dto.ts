import { IsIn, IsNotEmpty, IsNumber } from 'class-validator';

export class UpdateDrmDownloadStatus {
  @IsNotEmpty()
  @IsNumber()
  @IsIn([0, 1])
  status: number;
}
