import { Transform } from 'class-transformer';
import {
  IsArray,
  IsString,
  ArrayNotEmpty,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsInt,
} from 'class-validator';
import { WorkStatus } from 'src/common/enum/work-status.enum';
import { IsExist } from 'src/common/validation/isExists';

export class UpdateWorkReviewerDto {
  @IsNotEmpty()
  @IsExist({
    tableName: 'user',
    column: 'id',
    whereOf: [{ col: 'roles', val: 'faculty' }],
  })
  @IsNumber()
  reviewerId: number;

  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  workIds: number[];

  @IsOptional()
  @IsString()
  @IsIn([WorkStatus.Submitted])
  status: string = WorkStatus.Submitted;
}
