import { IsNotEmpty, IsString, IsEnum } from 'class-validator';

export enum ContactType {
  EMAIL = 'email',
  MOBILE = 'mobile',
}

export class EditContactDto {
  @IsEnum(ContactType)
  @IsNotEmpty()
  type: ContactType;

  @IsString()
  @IsNotEmpty()
  data: string;
}
