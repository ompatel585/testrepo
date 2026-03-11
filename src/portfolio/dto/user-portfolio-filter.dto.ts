import { IsEnum, IsOptional, ValidateNested, validate } from 'class-validator';
import { QueryParamsDto } from '../../common/dto/query-params.dto';
import { Transform, Type } from 'class-transformer';
import { stringToNumberArrayTransform } from 'src/common/transform/stringToNumberArray.transform';

export enum UserPortfolioSortBY {
  ID = 'id',
  CREATED_AT = 'created_at',
}

export class UserPortfolioFilterDto {
  @IsOptional()
  userId: number;
}

export class UserPortfolioQueryDto extends QueryParamsDto {
  @ValidateNested()
  @Type(() => UserPortfolioFilterDto)
  filter: UserPortfolioFilterDto;

  @IsOptional()
  @IsEnum(UserPortfolioSortBY)
  sortBy: UserPortfolioSortBY = UserPortfolioSortBY.ID;
}
