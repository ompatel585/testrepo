import { ArrayMaxSize, IsArray, IsNotEmpty, IsString, ValidateIf } from 'class-validator';

const OtherQualificationType = 'other';

export class EditProfileDto {
  @IsString()
  bio: string;

  @IsString()
  qualification: string;

  @ValidateIf((obj) => obj.qualification === OtherQualificationType)
  @IsString()
  @IsNotEmpty()
  otherQualification: string;

  @IsArray()
  @ArrayMaxSize(3)
  @IsString({
    each: true,
  })
  skills: string[];
}
