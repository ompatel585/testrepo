// login.dto.ts
import { IsNotEmpty, IsString } from 'class-validator';

export class CaptchaDto {
  @IsNotEmpty()
  @IsString()
  captcha: string;
}
