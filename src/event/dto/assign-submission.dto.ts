import { IsEnum, IsNumber } from 'class-validator';
import { JuryRole } from 'src/common/entities/eventRating.entity';

export class AssignSubmissionDto {
  @IsNumber()
  eventId: number;

  @IsEnum(JuryRole)
  juryType: JuryRole;

  @IsNumber()
  brandId: number;
}
