import { IsIn, IsNotEmpty, IsString } from 'class-validator';
import { IsValidExtensionMimePair } from 'src/common/validation/IsValidExtensionMimePair';
import { IsValidFileExtension } from 'src/common/validation/IsValidFileExtension';
export class InitiateMultiPartUploadDto {
  @IsNotEmpty()
  @IsString()
  @IsValidFileExtension(['.mp4', '.avi', '.mkv', '.pdf', '.zip', '.rar', '.7z'])
  fileName: string;

  @IsNotEmpty()
  @IsString()
  @IsIn(
    [
      'video/mp4',
      'video/x-msvideo', // AVI
      'video/x-matroska', // MKV
      'application/pdf',
      'application/zip',
      'application/x-rar-compressed',
      'application/x-7z-compressed',
    ],
    { message: 'Only mp4, avi, mkv, pdf, zip, rar, 7z files are allowed.' },
  )
  contentType: string;

  @IsValidExtensionMimePair({
    message: 'fileName and contentType do not match',
  })
  _validatePair: string;
}
