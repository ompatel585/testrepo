import { UseInterceptors, applyDecorators } from '@nestjs/common';
import { QueryTransformInterceptor } from './query-transform.interceptor';

/**
 * Transforms query parameters using the specified DTO and excludes certain properties from filtering.
 *
 * @param dto The DTO class to use for transforming query parameters.
 * @returns A decorator for transforming query parameters in NestJS controllers or methods.
 */
export function TransformQuery<T extends object>(dto: new () => T) {
  return applyDecorators(UseInterceptors(new QueryTransformInterceptor(dto)));
}
