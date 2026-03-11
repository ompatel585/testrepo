import {
  IsOptional,
  IsString,
  IsIn,
  IsEnum,
  ValidateNested,
  IsNumber,
} from 'class-validator';
import { QueryParamsDto } from '../../common/dto/query-params.dto';
import { WorkStatus } from 'src/common/enum/work-status.enum';
import { Type } from 'class-transformer';

export enum FacultyWorkSortBY {
  ID = 'id',
  CREATED_AT = 'created_at',
  SUBMITTED_AT = 'submittedAt',
}

export class FacultyWorkFilterDto {
  @IsOptional()
  @IsString()
  @IsIn([WorkStatus.Submitted, WorkStatus.Approved, WorkStatus.Rejected])
  status: string = WorkStatus.Submitted;

  @IsOptional()
  @IsString()
  reviewerId: number;

  @IsOptional()
  @Type(() => Number)
  @IsIn([1])
  unassigned: number;

  @IsOptional()
  @IsNumber()
  centreId: number;
}

export class FacultyWorkExclusionDto {
  @IsOptional()
  @IsString()
  reviewerId: number;
}

export class FacultyWorkQueryDto extends QueryParamsDto {
  @ValidateNested()
  @Type(() => FacultyWorkFilterDto)
  filter: FacultyWorkFilterDto;

  @ValidateNested()
  @Type(() => FacultyWorkExclusionDto)
  exclusion: FacultyWorkExclusionDto;

  @IsOptional()
  @IsEnum(FacultyWorkSortBY)
  sortBy: FacultyWorkSortBY = FacultyWorkSortBY.ID;
}
