import { IsEnum, IsNumber, IsOptional, IsString, Min, Max } from 'class-validator';
import { JuryRole, RatingStatus } from 'src/common/entities/eventRating.entity';

export class CreateEventRatingDto {
  @IsNumber()
  eventId: number;

  @IsNumber()
  categoryId: number;

  @IsString()
  studentId: string;

  @IsString()
  juryId: string;

  @IsEnum(JuryRole)
  juryRole: JuryRole;

  @IsNumber()
  submissionId: number;

  @IsOptional()
  @IsNumber()
  aiRating?: number | null;

  @IsOptional()
  @IsNumber()
  aiPlagiarised?: number | null;

  @IsOptional()
  @IsNumber()
  @Max(10, { message: 'Rating cannot be greater than 10.' })
  rating?: number;

  @IsOptional()
  @IsString()
  feedback?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  wishlist?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  wildcard?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  zap?: number;

  @IsOptional()
  @IsEnum(RatingStatus)
  status?: RatingStatus;
}
