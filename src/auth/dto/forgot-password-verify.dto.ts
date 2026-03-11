import { IsNotEmpty, IsString } from 'class-validator';

export class ForgotPasswordVerifyDto {
  @IsNotEmpty()
  @IsString()
  otp: string;

  @IsNotEmpty()
  @IsString()
  otpToken: string;
}
