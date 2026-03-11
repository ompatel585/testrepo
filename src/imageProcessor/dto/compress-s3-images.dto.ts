import { IsArray, IsEnum, IsString, ArrayNotEmpty, IsNotEmpty } from 'class-validator';

// Enum for the image types (either 'thumbnail' or 'view')
export enum ImageType {
  THUMBNAIL = 'thumbnail',
  VIEW = 'view',
}

// DTO for each image item
export class ImageDto {
  @IsString()
  @IsNotEmpty()
  imageKey: string;

  @IsEnum(ImageType)
  imageType: ImageType;

  @IsString()
  @IsNotEmpty()
  s3OutputPath: string;
}

// DTO for the overall request
export class CompressS3ImagesDto {
  @IsArray()
  @ArrayNotEmpty()
  images: ImageDto[];
}
