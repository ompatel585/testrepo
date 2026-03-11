import { IsNotEmpty, IsString } from 'class-validator';

export class GuestSocialOAuthRegisterDto {
  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  name: string;
}
