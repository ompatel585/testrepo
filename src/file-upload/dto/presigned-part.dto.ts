import { IsNotEmpty, IsString, IsInt, Min } from 'class-validator';

export class PresignedPartDto {
  @IsNotEmpty()
  @IsString()
  filePath: string;

  @IsNotEmpty()
  @IsString()
  uploadId: string;

  @IsNotEmpty()
  @IsInt()
  @Min(1, { message: 'PartNumber must be >= 1' })
  partNumber: number;
}
