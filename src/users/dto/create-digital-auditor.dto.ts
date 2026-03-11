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
import { IsExistInArray } from 'src/common/validation/isExistInArray.constrain';

export class CreateDigitalAuditorDto extends CreateProfileDto {
  @IsNotEmpty()
  @IsString()
  @IsAlreadyExist({ tableName: 'user', column: 'userId' })
  userId: string;

  @IsOptional()
  @IsIn([Role.DigitalAuditor])
  role: Role = Role.DigitalAuditor;

  @IsOptional()
  @IsArray()
  @IsIn([Role.DigitalAuditor], { each: true })
  roles: Role[] = [Role.DigitalAuditor];

  // over ride profile

  @IsNotEmpty()
  @IsString()
  mobile: string;

  @IsExist({ tableName: 'brand', column: 'id' })
  @IsNumber()
  @IsNotEmpty()
  brandId: number;

  @IsExistInArray({ tables: [{ tableName: 'brand', columns: ['id'] }] })
  @IsArray()
  @IsNumber({}, { each: true })
  subBrandIds: number[];
}
