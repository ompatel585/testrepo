import {
  ArrayNotEmpty,
  IsArray,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
  ValidateIf,
} from 'class-validator';
import { AddFileDto } from './add-file.dto';
import { Type } from 'class-transformer';
import { WorkStatus } from 'src/common/enum/work-status.enum';
import { IsExist } from 'src/common/validation/isExists';

export class CreateWorkDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsNotEmpty()
  @IsExist({ tableName: 'work_category', column: 'id' })
  @IsNumber()
  workCategoryId: number;

  @IsNotEmpty()
  @IsNumber()
  @IsIn([0, 1])
  reviewRequired: number;

  @ValidateIf((obj) => obj.reviewRequired === 1)
  @ValidateIf((obj) => obj.status !== WorkStatus.Draft)
  @IsNotEmpty()
  @IsExist({
    tableName: 'user',
    column: 'id',
    whereOf: [{ col: 'roles', val: 'faculty' }],
  })
  @IsNumber()
  reviewerId: number;

  @IsArray()
  @IsString({ each: true })
  tags: string[];

  @IsNotEmpty()
  @IsString()
  thumbnailFileName: string;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => AddFileDto)
  addFiles: AddFileDto[];

  @IsNotEmpty()
  @IsString()
  @IsIn([WorkStatus.Draft, WorkStatus.Submitted])
  status: string;
}
