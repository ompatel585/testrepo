import { IsNotEmpty } from 'class-validator';

export enum S3DirType {
  PROFILE = 'profile',
  WORK = 'work',
}

export class PresignedURLKeyDto {
  @IsNotEmpty()
  presignedURLKey: string;
}
