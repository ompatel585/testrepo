import {
  IsNotEmpty,
  IsString,
  IsArray,
  ValidateNested,
  IsInt,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

class PartDetailsDto {
  @IsNotEmpty()
  @IsString()
  ETag: string;

  @IsNotEmpty()
  @IsInt()
  @Min(1, { message: 'PartNumber must be >= 1' })
  PartNumber: number;
}

export class CompleteMultipartUploadDto {
  @IsNotEmpty()
  @IsString()
  filePath: string;

  @IsNotEmpty()
  @IsString()
  uploadId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PartDetailsDto)
  parts: PartDetailsDto[];
}
