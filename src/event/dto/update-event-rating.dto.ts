import { IsEnum, IsInt, IsNotEmpty, IsOptional, Max, Min } from 'class-validator';
import { RatingStatus } from 'src/common/entities/eventRating.entity';

export class UpdateEventRatingDto {
  @IsInt()
  @IsNotEmpty()
  ratingId: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(5)
  aiRating?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(5)
  rating?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1)
  wishlist?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1)
  wildcard?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1)
  zap?: number;

  @IsOptional()
  @IsEnum(RatingStatus)
  status?: RatingStatus;
}
