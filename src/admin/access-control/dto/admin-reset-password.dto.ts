import { IsNotEmpty, IsString } from 'class-validator';

export class AdminResetPasswordDto {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
