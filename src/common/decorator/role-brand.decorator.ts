import { SetMetadata } from '@nestjs/common';
import { Role } from '../enum/role.enum';

export const ROLE_BRAND_KEY = 'role_brand';
export interface RoleBrand {
  brandId: number;
  role: Role;
}

export const RoleBrand = (...pairs: RoleBrand[]) => SetMetadata(ROLE_BRAND_KEY, pairs);
