import { IsEnum, IsIn, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { QueryParamsDto } from 'src/common/dto/query-params.dto';

export enum AssetSortBy {
  ID = 'id',
  POSITION = 'position',
  CREATED_AT = 'createdAt',
}

export class AssetFilterDto {
  @IsOptional()
  @IsIn([0, 1], { message: 'Status must be either 0 or 1' })
  status: number = 1;

  @IsOptional()
  @IsString()
  brandId: string;
}

export class AssetQueryDto extends QueryParamsDto {
  @ValidateNested()
  @Type(() => AssetFilterDto)
  filter?: AssetFilterDto;

  @IsOptional()
  @IsEnum(AssetSortBy)
  sortBy: AssetSortBy = AssetSortBy.ID;
}
