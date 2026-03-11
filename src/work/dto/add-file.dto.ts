import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';
import { IsValidFileExtension } from 'src/common/validation/IsValidFileExtension';

export const workFileUploadFileType = {
  fileExtensions: ['.jpg', '.jpeg', '.png', '.mp4', '.gif'],
  fileTypeMap: {
    jpg: 'image',
    jpeg: 'image',
    png: 'image',
    mp4: 'video',
    gif: 'image',
  },
};
export class AddFileDto {
  @IsNotEmpty()
  @IsString()
  @IsValidFileExtension(workFileUploadFileType.fileExtensions)
  fileName: string;
}

export class AddFilesDto {
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => AddFileDto)
  addFiles: AddFileDto[];
}
