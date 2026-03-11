import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString, ValidateNested } from 'class-validator';
import { CompanyLogoDto } from './company-logo.dto';

export class CreateCompanyDto {
  @IsNotEmpty()
  @IsString()
  companyName: string;

  @IsString()
  website: string;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  companyCategoryId: number;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  companyTypeId: number;

  @ValidateNested()
  @Type(() => CompanyLogoDto)
  companyLogo: CompanyLogoDto;
}
