import { PartialType } from '@nestjs/mapped-types';
import { AdminCreateLearningCircleDto } from './admin-learningCircle-create.dto';
import { OmitType } from '@nestjs/swagger';

export class AdminLearningCircleUpdateDto extends PartialType(
  OmitType(AdminCreateLearningCircleDto, ['contentFile']),
) {}
