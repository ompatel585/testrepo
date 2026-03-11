import {
  IsArray,
  IsEmpty,
  IsEnum,
  isNotEmpty,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';
import {
  SubmissionFileType,
  SubmissionStatus,
} from 'src/common/entities/eventSubmission.entity';

export class ArtworkDto {
  @IsString()
  @IsNotEmpty()
  fileType: string;

  @IsString()
  @IsNotEmpty()
  artworkUrl: string;

  @IsString()
  @IsOptional()
  externalUrl: string;
}

export class CreateSubmissionDto {
  @IsString()
  @IsNotEmpty()
  courseCode: string;

  @IsString()
  @IsNotEmpty()
  studentId: string;

  @IsString()
  @IsOptional()
  studentEmail: string;

  @IsNumber()
  @IsNotEmpty()
  eventId: number;

  @IsString()
  @IsNotEmpty()
  thumbnailUrl: string;

  @IsArray()
  @IsNotEmpty()
  artworks: [ArtworkDto];

  @IsNumber()
  @IsNotEmpty()
  categoryId: number;

  @IsNumber()
  @IsOptional()
  centreId: number;

  @IsEnum(SubmissionStatus)
  @IsOptional()
  submissionStatus?: SubmissionStatus;
}
