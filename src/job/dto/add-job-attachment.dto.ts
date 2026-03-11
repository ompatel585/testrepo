import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';

export class AddJobAttachmentDto {
  @IsNotEmpty()
  @IsString()
  fileName: string;

  @IsNotEmpty()
  @IsString()
  fileType: string;

  @IsNotEmpty()
  @IsString()
  ext: string;
}

export class AddJobAttachmentsDto {
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => AddJobAttachmentDto)
  addJobAttachments: AddJobAttachmentDto[];
}
