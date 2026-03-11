import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class AdminLearningCircleUpdateVideoFileDto {
  @IsNotEmpty()
  @IsString()
  @Matches(/\.(mp4|avi|mkv')$/i, {
    message: 'video file should be in .mp4, .avi or .mkv  formats',
  })
  video: string;
}
