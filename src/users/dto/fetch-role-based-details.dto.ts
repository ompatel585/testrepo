import { IsEnum, IsIn, IsNumber, ValidateIf } from 'class-validator';
import { Role } from 'src/common/enum/role.enum';
import { IsExist } from 'src/common/validation/isExists';

export class FetchRoleBasedDetailsDto {
  @IsEnum(Role, { message: 'Invalid role provided!' })
  role: Role;

  @ValidateIf((object) => object.brandId != null)
  @IsExist({ tableName: 'brand', column: 'id' })
  @IsNumber()
  brandId: number | null = null;
}
