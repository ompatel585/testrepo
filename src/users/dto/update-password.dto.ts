import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class PasswordDto {
  @IsString()
  @IsOptional()
  center: string;

  @IsOptional()
  excludeUsers: number[] = [0];
}
