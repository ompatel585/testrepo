// login.dto.ts
import { IsNotEmpty, IsString } from 'class-validator';

export class OrgLoginDto {
  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
