import { PartialType } from '@nestjs/swagger';
import { CreateDrmDto } from './create-drm.dto';
import { OmitType } from '@nestjs/mapped-types';
import { IsDefined, IsIn, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class UpdateDrmDto extends PartialType(
  OmitType(CreateDrmDto, ['files', 'title', 'filePath', 'fileName']),
) {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  filePath: string;

  @IsNotEmpty()
  @IsString()
  fileName: string;
}
