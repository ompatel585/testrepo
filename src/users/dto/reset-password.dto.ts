import { IsArray, IsString, ArrayNotEmpty, IsIn } from 'class-validator';

export class ResetPasswordDto {
  @IsArray()
  @IsString({ each: true })
  @ArrayNotEmpty()
  userKey: string[];

  @IsIn([0, 1])
  sendMail: 0 | 1 = 0;
}
