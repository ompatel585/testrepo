import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsDefined,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

class DrmFiles {
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
export class CreateDrmDto {
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  author: string = 'Aptech';

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  publisher: string = 'Aptech';

  @IsDefined()
  @IsNumber()
  @IsIn([0, 1])
  allowCopy: number;

  @IsDefined()
  @IsNumber()
  @IsIn([0, 1])
  allowPrint: number;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => DrmFiles)
  files: DrmFiles[];

  @IsOptional()
  title: string;

  @IsOptional()
  filePath: string;

  @IsOptional()
  fileName: string;
}
