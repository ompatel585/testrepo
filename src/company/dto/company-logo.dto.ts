import { IsInt, IsString, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CompanyLogoDto {
  @IsString()
  ext: string;

  @IsString()
  fileName: string;

  @IsString()
  fileType: string;
}

/*export class CompanyLogosDto {
  @Type(() => CompanyLogoDto)
  companyLogo: CompanyLogoDto;
}*/
