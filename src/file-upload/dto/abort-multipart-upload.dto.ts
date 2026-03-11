import { IsNotEmpty, IsString } from 'class-validator';

export class AbortMultipartUploadDto {
  @IsNotEmpty()
  @IsString()
  filePath: string;

  @IsNotEmpty()
  @IsString()
  uploadId: string;
}
