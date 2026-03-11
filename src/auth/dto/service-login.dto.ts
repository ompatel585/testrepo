import { IsNotEmpty, IsString } from 'class-validator';

export class ServiceLoginDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
