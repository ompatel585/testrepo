import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class AdminLearningCircleUpdateContentFileDto {
  @IsNotEmpty()
  @IsString()
  @Matches(/\.(pdf|txt)$/i, {
    message: 'content file should be in .pdf|.txt formats',
  })
  contentFile: string;
}
