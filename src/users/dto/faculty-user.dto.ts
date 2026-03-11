import {
  IsOptional,
  IsString,
  IsIn,
  IsEnum,
  ValidateNested,
  IsNumber,
  IsNotEmpty,
} from 'class-validator';
import { QueryParamsDto } from '../../common/dto/query-params.dto';
import { WorkStatus } from 'src/common/enum/work-status.enum';
import { Type } from 'class-transformer';
import { Role } from 'src/common/enum/role.enum';
import { Roles } from 'src/common/decorator/roles.decorator';
import { IsExist } from 'src/common/validation/isExists';

export enum FacultyUserSortBY {
  ID = 'id',
  CREATED_AT = 'created_at',
}

export class FacultyUserFilterDto {
  @IsOptional()
  @IsIn([Role.Faculty])
  role: string = Role.Faculty;

  @IsOptional()
  @IsExist({ tableName: 'brand', column: 'id' })
  @Type(() => Number)
  @IsNumber()
  brandId: number;

  @IsOptional()
  centreIds: number;
}

export class FacultyUserQueryDto extends QueryParamsDto {
  @ValidateNested()
  @Type(() => FacultyUserFilterDto)
  filter: FacultyUserFilterDto;

  @IsOptional()
  @IsEnum(FacultyUserSortBY)
  sortBy: FacultyUserSortBY = FacultyUserSortBY.ID;
}
