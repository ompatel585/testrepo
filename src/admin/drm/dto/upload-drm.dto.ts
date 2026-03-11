import { IsNotEmpty, IsString } from 'class-validator';

export class UploadDrmDto {
  @IsNotEmpty()
  @IsString()
  fileName: string;
}
