import { IsNotEmpty, IsString } from 'class-validator';
import { IsValidFileExtension } from 'src/common/validation/IsValidFileExtension';

export class AddThumbnailDto {
  @IsNotEmpty()
  @IsString()
  @IsValidFileExtension()
  fileName: string;
}
