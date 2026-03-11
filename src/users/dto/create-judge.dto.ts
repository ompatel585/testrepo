import {
  IsArray,
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Role } from 'src/common/enum/role.enum';
import { IsAlreadyExist } from 'src/common/validation/isAlreadyExists';
import { Transform } from 'class-transformer';

export class CreateJudgeDto {
  @IsNotEmpty()
  @IsString()
  @IsAlreadyExist({ tableName: 'user', column: 'userId' })
  userId: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsIn([Role.Judge])
  role: Role = Role.Judge;

  @IsOptional()
  @IsArray()
  @IsIn([Role.Judge], { each: true })
  roles: Role[] = [Role.Judge];

  @IsNotEmpty()
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase().trim())
  email: string;

  @IsNotEmpty()
  @IsString()
  mobile: string;
}
