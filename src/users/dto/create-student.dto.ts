import {
  IsArray,
  IsBoolean,
  IsEnum,
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
import { OmitType } from '@nestjs/mapped-types';
import { BrandUniversityCode } from 'src/common/enum/brand.enum';
import { User_Type } from 'src/common/entities/user.entity';
export class CreateStudentDto extends OmitType(CreateProfileDto, [] as const) {
  @IsNotEmpty()
  @IsString()
  @IsAlreadyExist({ tableName: 'user', column: 'userId', caseInsensitive: true })
  userId: string;

  /**
   * validation order is from bottom to top
   * @IsNotEmpty => @IsNumber =>  @IsExist
   */
  @IsExist({ tableName: 'brand', column: 'id' })
  @IsNumber()
  @IsNotEmpty()
  brandId: number;

  @IsExistInArray({ tables: [{ tableName: 'brand', columns: ['id'] }] })
  @IsArray()
  subBrandIds: number[] = [];

  @IsOptional()
  @IsIn([Role.Student])
  role: Role = Role.Student;

  @IsOptional()
  @IsArray()
  @IsIn([Role.Student], { each: true })
  roles: Role[] = [Role.Student];

  @IsNumber()
  centerId: number;

  @IsBoolean()
  isDomestic: boolean = true;

  // over ride profile

  @IsOptional()
  @IsEnum(BrandUniversityCode)
  universityCode?: BrandUniversityCode;

  @IsIn([User_Type.Student])
  @IsEnum(User_Type)
  userType: User_Type = User_Type.Student;
}
