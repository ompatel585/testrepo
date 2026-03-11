import { IsNotEmpty, IsString, IsEnum } from 'class-validator';

export enum ContactType {
  EMAIL = 'email',
  MOBILE = 'mobile',
}

export class VerifyUserAndUpdatePass {
  @IsEnum(ContactType)
  @IsNotEmpty()
  type: ContactType;

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
