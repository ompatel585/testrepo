import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  isString,
  IsString,
  ValidateIf,
} from 'class-validator';
import {
  SubmissionFileType,
  SubmissionStatus,
} from 'src/common/entities/eventSubmission.entity';

export class CreateProfessionalSubmissionDto {
  @IsString()
  @IsNotEmpty()
  courseCode: string;

  @IsString()
  @IsNotEmpty()
  userName: string;

  @IsString()
  @IsNotEmpty()
  university: string;

  @IsNumber()
  @IsNotEmpty()
  brandId: number;

  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsOptional()
  userEmail: string;

  @IsNumber()
  @IsNotEmpty()
  eventId: number;

  @IsNotEmpty()
  @IsEnum(SubmissionFileType)
  fileType: SubmissionFileType;

  @IsNotEmpty({ message: 'filePath is required when fileType is not youtube' })
  @IsString()
  filePath: string;

  @IsNumber()
  @IsOptional()
  categoryId: number;

  @IsNumber()
  @IsOptional()
  centreId: number;

  @IsEnum(SubmissionStatus)
  @IsOptional()
  submissionStatus?: SubmissionStatus;

  // token
  @ValidateIf((obj) => 'studentEmail' in obj)
  @IsNotEmpty()
  @IsString()
  emailToken: string;

  @ValidateIf((obj) => 'studentEmail' in obj)
  @IsNotEmpty()
  @IsString()
  emailOtp: string;
}
