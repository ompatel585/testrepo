import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export enum socialOAuthType {
  Google = 'google',
  Facebook = 'facebook',
}
export class GuestSocialOAuthAccessTokenDto {
  @IsNotEmpty()
  @IsString()
  accessToken: string;

  @IsNotEmpty()
  @IsEnum(socialOAuthType)
  type: string;
}
