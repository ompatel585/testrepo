import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class AdminLearningCircleUpdateThumbnailFileDto {
  @IsNotEmpty()
  @IsString()
  @Matches(/\.(jpg|jpeg|png|gif|webp')$/i, {
    message: 'thumbnail should be in .jpg, jpeg, .png, .gif or .webp formats',
  })
  thumbnail: string;
}
