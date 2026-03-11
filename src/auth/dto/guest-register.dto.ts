import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, ValidateIf } from 'class-validator';
import { IsAlreadyExist } from 'src/common/validation/isAlreadyExists';

export class GuestRegisterDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @ValidateIf((obj) => !('mobile' in obj) || 'email' in obj)
  @IsNotEmpty()
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase())
  email: string;

  @ValidateIf((obj) => !('email' in obj) || 'mobile' in obj)
  @IsNotEmpty()
  @IsString()
  mobile: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @ValidateIf((obj) => 'mobile' in obj)
  @IsNotEmpty()
  @IsString()
  mobileOtp: string;

  @ValidateIf((obj) => 'email' in obj)
  @IsNotEmpty()
  @IsString()
  emailOtp: string;

  // token
  @ValidateIf((obj) => 'email' in obj)
  @IsNotEmpty()
  @IsString()
  emailToken: string;

  @ValidateIf((obj) => 'mobile' in obj)
  @IsNotEmpty()
  @IsString()
  mobileToken: string;
}
