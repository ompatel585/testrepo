import {
  IsArray,
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Role } from 'src/common/enum/role.enum';
import { IsAlreadyExist } from 'src/common/validation/isAlreadyExists';
import { IsExist } from 'src/common/validation/isExists';
import { CreateProfileDto } from './common/create-profile.dto';

export class CreateAdminDto extends CreateProfileDto {
  @IsNotEmpty()
  @IsString()
  @IsAlreadyExist({ tableName: 'user', column: 'userId' })
  userId: string;

  @IsOptional()
  @IsIn([Role.Admin])
  role: Role = Role.Admin;

  @IsOptional()
  @IsArray()
  @IsIn([Role.Admin], { each: true })
  roles: Role[] = [Role.Admin];

  // over ride profile

  @IsNotEmpty()
  @IsString()
  mobile: string;
}
