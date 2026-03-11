import { Transform } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';
import { ProconnectCenterEmployeeTypeRolesArray, Role } from 'src/common/enum/role.enum';
import { IsAlreadyExist } from 'src/common/validation/isAlreadyExists';
import { IsExist } from 'src/common/validation/isExists';
import { CreateProfileDto } from './common/create-profile.dto';
import { IsExistInArray } from 'src/common/validation/isExistInArray.constrain';
import { OmitType } from '@nestjs/mapped-types';
import { BrandUniversityCode } from 'src/common/enum/brand.enum';
import {
  BrandRole,
  SubBrands,
  TopAccessItem,
} from 'src/common/entities/user-metadata.entity';
import { User_Type } from 'src/common/entities/user.entity';

export class CreateFacultyDto extends OmitType(CreateProfileDto, ['email'] as const) {
  @IsNotEmpty()
  @IsString()
  @IsAlreadyExist({ tableName: 'user', column: 'userId', caseInsensitive: true })
  userId: string;

  // TODO validation improvement required
  brandIds: BrandRole[];

  @IsBoolean()
  isDomestic: boolean = true;

  // over ride profile
  @IsOptional()
  @Transform(({ value }) => value.toLowerCase().trim())
  email: string;

  @IsOptional()
  @IsEnum(BrandUniversityCode)
  universityCode?: BrandUniversityCode;

  SubBrands: SubBrands[] = [];

  @IsEnum(User_Type)
  userType: User_Type = User_Type.CE;
}

export class CreateAeFacultyDto extends OmitType(CreateFacultyDto, [
  'brandIds',
] as const) {
  @IsNotEmpty()
  @IsString()
  @IsAlreadyExist({ tableName: 'user', column: 'userId', caseInsensitive: true })
  userId: string;

  // TODO validation improvement required
  TopAccess: TopAccessItem[];

  @IsBoolean()
  isDomestic: boolean = true;

  // over ride profile
  @IsOptional()
  @Transform(({ value }) => value.toLowerCase().trim())
  email: string;

  @IsOptional()
  @IsEnum(BrandUniversityCode)
  universityCode?: BrandUniversityCode;

  SubBrands: SubBrands[] = [];

  @IsEnum(User_Type)
  userType: User_Type = User_Type.AE;
}
