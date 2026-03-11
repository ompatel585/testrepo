import { PartialType, OmitType, IntersectionType, PickType } from '@nestjs/mapped-types';
import { CreateWorkDto } from './create-work.dto';
import { IsNotEmpty, IsString, IsIn, IsOptional } from 'class-validator';
import { WorkStatus } from 'src/common/enum/work-status.enum';
/**
 * Omit status as well so can be defined again to make it required!
 */
export class UpdateWorkDto extends PartialType(
  OmitType(CreateWorkDto, ['thumbnailFileName', 'status']),
) {
  @IsOptional()
  @IsString()
  @IsIn([WorkStatus.Draft, WorkStatus.Submitted])
  status: string;
}
