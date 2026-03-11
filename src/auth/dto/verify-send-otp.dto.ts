import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, IsEnum, IsOptional, IsNumber } from 'class-validator';

export enum ContactType {
  EMAIL = 'email',
  MOBILE = 'mobile',
}

export class VerifyUserAndSendOTP {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsEnum(ContactType)
  @IsNotEmpty()
  type: ContactType;

  @IsString()
  @IsNotEmpty()
  data: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  brandKey: number;
}
