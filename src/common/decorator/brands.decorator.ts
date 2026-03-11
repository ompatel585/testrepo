import { SetMetadata } from '@nestjs/common';

export const BRANDS_KEY = 'brands';
export const Brand = (...brandIds: number[]) => SetMetadata(BRANDS_KEY, brandIds);
