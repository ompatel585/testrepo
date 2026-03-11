import { IsEnum, IsString } from 'class-validator';

enum TokenType {
  FCM_WEB = 'fcmWebToken',
  FCM_ANDROID = 'fcmAndroidToken',
  FCM_IOS = 'fcmIosToken',
}
export class SaveTokenDto {
  @IsEnum(TokenType)
  type: TokenType;

  @IsString()
  fcmToken: string;
}
