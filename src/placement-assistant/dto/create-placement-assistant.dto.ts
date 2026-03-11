import { IsIn, IsNotEmpty, IsNumber, IsString, IsDate, IsBoolean } from 'class-validator';

import { Type } from 'class-transformer';
import { IsExist } from 'src/common/validation/isExists';
export class CreatePlacementAssistantDto {
  @IsNotEmpty()
  @IsExist({ tableName: 'JobTitle', column: 'id' })
  @Type(() => Number)
  jobTitleId: number;

  @IsString()
  educationQualification: string;

  @IsString()
  otherQualification: string;

  @IsIn([0, 1])
  isFreelancing: number;

  @IsNotEmpty()
  @IsExist({ tableName: 'City', column: 'id' })
  @Type(() => Number)
  cityId: number;

  @IsString()
  previousJobExperience: string;

  @IsString()
  portfolioLink: string;

  @IsIn([0, 1])
  isConfirmPlacement: number;

  @IsNotEmpty()
  @IsString()
  attachmentFile: string;
}
