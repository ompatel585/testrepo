import { PartialType } from '@nestjs/mapped-types';
import { CreatePlacementAssistantDto } from './create-placement-assistant.dto';

export class UpdatePlacementAssistantDto extends PartialType(
  CreatePlacementAssistantDto,
) {}
