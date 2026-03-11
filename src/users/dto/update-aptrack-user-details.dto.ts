import { IsIn, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { IsExist } from 'src/common/validation/isExists';

export class UpdateAptrackUserDetailsDto {
  @IsNotEmpty()
  @IsString()
  @IsExist({ tableName: 'user', column: 'userId' })
  userId: string;

  @IsOptional()
  @IsString()
  email: string;

  @IsOptional()
  @IsString()
  mobile: string;

  @IsOptional()
  @IsNumber()
  @IsIn([1])
  isEmailVerified: number;

  @IsOptional()
  @IsNumber()
  @IsIn([1])
  isSMSVerified: number;
}
