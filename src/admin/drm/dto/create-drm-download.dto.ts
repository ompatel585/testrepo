import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateDrmDownloadDto {
  @IsString()
  @IsNotEmpty()
  resourceId: string;

  @IsInt()
  @IsNotEmpty()
  userId: number;

  @IsInt()
  @IsNotEmpty()
  courseModuleId: number;

  @IsInt()
  @IsNotEmpty()
  transaction: number;
}
