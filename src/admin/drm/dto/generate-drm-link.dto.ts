import { IsNotEmpty, IsString } from 'class-validator';

export class GenerateDrmLinkDto {
  @IsNotEmpty()
  @IsString()
  resourceId: string;
}
