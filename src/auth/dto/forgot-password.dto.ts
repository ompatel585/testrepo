import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, ValidateIf } from 'class-validator';

export enum ForgotPasswordDtoUserType {
  Student = 'student',
  Guest = 'guest',
}

export enum ForgotPasswordDtoEnterType {
  Mobile = 'mobile',
  Email = 'email',
}

export class ForgotPasswordDto {
  @ApiProperty({
    enum: ForgotPasswordDtoUserType,
    example: ForgotPasswordDtoUserType.Guest,
  })
  @IsNotEmpty()
  @IsEnum(ForgotPasswordDtoUserType)
  userType: string;

  @ApiProperty({
    description: 'required if userType = ' + ForgotPasswordDtoUserType.Student,
  })
  @ValidateIf((obj) => obj.userType === ForgotPasswordDtoUserType.Student)
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    enum: ForgotPasswordDtoEnterType,
    description: 'required if userType = ' + ForgotPasswordDtoUserType.Guest,
    example: ForgotPasswordDtoEnterType.Email,
  })
  @ValidateIf((obj) => obj.userType === ForgotPasswordDtoUserType.Guest)
  @IsNotEmpty()
  @IsEnum(ForgotPasswordDtoEnterType)
  type: string;

  @ApiProperty({
    description: 'email or mobile at least one required',
    example: 'guest01@mail.com',
  })
  @ValidateIf(
    (obj) =>
      obj.type === ForgotPasswordDtoEnterType.Email &&
      obj.userType === ForgotPasswordDtoUserType.Guest,
  )
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'email or mobile at least one required',
  })
  @ValidateIf(
    (obj) =>
      obj.type === ForgotPasswordDtoEnterType.Mobile &&
      obj.userType === ForgotPasswordDtoUserType.Guest,
  )
  @IsNotEmpty()
  mobile: string;
}
