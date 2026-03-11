import { IsNotEmpty, IsString } from 'class-validator';

export class ResetPasswordV2dDto {
  @IsNotEmpty()
  @IsString()
  newPassword: string;

  @IsNotEmpty()
  @IsString()
  confirmPassword: string;
}
