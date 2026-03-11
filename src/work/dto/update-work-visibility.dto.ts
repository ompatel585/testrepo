import { IsIn, IsNotEmpty } from 'class-validator';

export class UpdateWorkVisibilityDto {
  @IsNotEmpty()
  @IsIn([0, 1])
  visibility: number;
}
