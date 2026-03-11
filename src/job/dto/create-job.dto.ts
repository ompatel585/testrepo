import {
  IsArray,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PackageType } from 'src/common/enum/package-type.enum';
import { AddJobAttachmentDto } from './add-job-attachment.dto';

export class CreateJobDto {
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  brandId: number;

  @IsString()
  zone: string;

  @IsString()
  area: string;

  @IsString()
  region: string;

  @IsNumber()
  @Type(() => Number)
  centreId: number;

  @IsNumber()
  @Type(() => Number)
  companyId: number;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  jobTitleId: number;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  noOfVacancy: number;

  @IsNumber()
  @Type(() => Number)
  cityId: number;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  jobTypeId: number;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  skillCategoryId: number;

  @IsNotEmpty()
  @IsString()
  applicationLastDate: Date;

  @IsString()
  jobDescription: string;

  @IsNotEmpty()
  @IsString()
  @IsIn([PackageType.Fix, PackageType.Range])
  packageType: string;

  @IsNumber()
  @Type(() => Number)
  package: number;

  @IsNumber()
  @Type(() => Number)
  packageFrom: number;

  @IsNumber()
  @Type(() => Number)
  packageTo: number;

  @IsIn([0, 1])
  @Type(() => Number)
  isBond: number;

  @IsArray()
  @ValidateNested({ each: false })
  @Type(() => AddJobAttachmentDto)
  addJobAttachments: AddJobAttachmentDto[];
}
