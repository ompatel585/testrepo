import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, ValidateIf } from 'class-validator';
import { IsAlreadyExist } from 'src/common/validation/isAlreadyExists';

export class GuestGenerateOtp {
  @ValidateIf((obj) => !('mobile' in obj) || 'email' in obj)
  @IsNotEmpty()
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase())
  @IsAlreadyExist({ tableName: 'user', column: 'email', where: [{ role: 'guest' }] })
  email: string;

  @ValidateIf((obj) => !('email' in obj) || 'mobile' in obj)
  @IsNotEmpty()
  @IsString()
  @IsAlreadyExist({ tableName: 'user', column: 'mobile', where: [{ role: 'guest' }] })
  mobile: string;
}
