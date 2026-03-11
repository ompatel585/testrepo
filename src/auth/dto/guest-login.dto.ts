import { Transform } from 'class-transformer';
import { IsEmail, IsEnum, IsNotEmpty, IsString, ValidateIf } from 'class-validator';

export enum GuestLoginDtoType {
  Mobile = 'mobile',
  Email = 'email',
}

export class GuestLoginDto {
  @ValidateIf((obj) => obj.type == GuestLoginDtoType.Email)
  @IsNotEmpty()
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase())
  email: string;

  @ValidateIf((obj) => obj.type == GuestLoginDtoType.Mobile)
  @IsNotEmpty()
  mobile: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsEnum(GuestLoginDtoType)
  type: string;
}
