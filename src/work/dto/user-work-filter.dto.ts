import {
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
  validate,
} from 'class-validator';
import { QueryParamsDto } from '../../common/dto/query-params.dto';
import { Transform, Type } from 'class-transformer';
import { stringToNumberArrayTransform } from 'src/common/transform/stringToNumberArray.transform';
import { WorkStatus } from 'src/common/enum/work-status.enum';

export enum UserWorkSortBY {
  ID = 'id',
  CREATED_AT = 'created_at',
}

export class UserWorkFilterDto {
  @IsOptional()
  @Transform(({ value }) => stringToNumberArrayTransform(value))
  id: number[];

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  userId: number;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @IsEnum(WorkStatus)
  status: WorkStatus;

  @IsOptional()
  @IsNotEmpty()
  @Type(() => Number)
  @IsIn([0, 1])
  visibility: 0 | 1 = 1;
}

export class UserWorkExclusionDto {
  @IsOptional()
  @Transform(({ value }) => stringToNumberArrayTransform(value))
  id: number[];
}
export class UserWorkQueryDto extends QueryParamsDto {
  @ValidateNested()
  @Type(() => UserWorkFilterDto)
  filter: UserWorkFilterDto;

  @ValidateNested()
  @Type(() => UserWorkExclusionDto)
  exclusion: UserWorkExclusionDto;

  @IsOptional()
  @IsEnum(UserWorkSortBY)
  sortBy: UserWorkSortBY = UserWorkSortBY.ID;
}
