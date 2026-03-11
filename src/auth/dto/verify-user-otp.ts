import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, IsEnum, IsOptional, IsNumber } from 'class-validator';

export enum ContactType {
  EMAIL = 'email',
  MOBILE = 'mobile',
}

export class VerifyUserOTP {
  @IsEnum(ContactType)
  @IsNotEmpty()
  type: ContactType;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  brandKey: number;

  @IsString()
  @IsNotEmpty()
  data: string;

  @IsString()
  @IsNotEmpty()
  otp: string;

  @IsString()
  @IsNotEmpty()
  token: string;

  @IsString()
  @IsNotEmpty()
  userId: string;
}
