import { IsNotEmpty, IsString, IsEnum } from 'class-validator';

export enum ContactType {
  EMAIL = 'email',
  MOBILE = 'mobile',
}

export class UpdateContactDto {
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
}
