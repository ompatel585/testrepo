import { Transform } from 'class-transformer';
import {
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

export class CreateProfileDto {
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsOptional()
  @IsString()
  middleName: string;

  @IsOptional()
  @IsString()
  lastName: string;

  @Transform(({ value }) => (value === '' ? null : value))
  @IsOptional()
  @IsDateString()
  dob: Date;

  @IsNotEmpty()
  @Transform(({ value }) => value.toLowerCase().trim())
  email: string;

  @Transform(({ value }) => (value === '' ? null : value))
  @IsOptional()
  @IsString()
  mobile: string;

  @IsOptional()
  @IsString()
  address: string;

  @IsOptional()
  @IsString()
  country: string;

  @IsOptional()
  @IsString()
  state: string;

  @IsOptional()
  @IsString()
  city: string;

  @IsOptional()
  @IsString()
  pinCode: string;

  @IsOptional()
  @IsNumber()
  @IsIn([0, 1])
  isEmailVerified: number = 0;

  @IsOptional()
  @IsNumber()
  @IsIn([0, 1])
  isMobileVerified: number = 0;
}
