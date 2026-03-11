import { IsBoolean, IsInt } from 'class-validator';

export class CreateEventAssignToRateDto {
  @IsInt()
  eventId: number;

  @IsInt()
  userId: number;

  @IsInt()
  submissionId: number;

  @IsBoolean()
  isRated: boolean;
}
