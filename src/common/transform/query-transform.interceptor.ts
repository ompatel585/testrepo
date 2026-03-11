import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { plainToClass } from 'class-transformer';

@Injectable()
export class QueryTransformInterceptor<T extends object> implements NestInterceptor {
  constructor(private readonly dto: new () => any) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest();
    const queryParams = request.query;

    const filterParams: Record<string, any> = {};
    const exclusionParams: Record<string, any> = {};
    const topLevelParams: Record<string, any> = {};
    const betweenParams: Record<string, any> = {};

    for (const key in queryParams) {
      const value = queryParams[key];

      // If the key starts with `exclude_`, strip the prefix and add it to exclusions
      if (key.startsWith('exclude_')) {
        const cleanKey = key.replace('exclude_', '');
        exclusionParams[cleanKey] = value;
        continue;
      }

      // Between ranges: createdAtFrom / createdAtTo
      if (key.endsWith('From') || key.endsWith('To')) {
        const baseKey = key.replace(/(From|To)$/, ''); // createdAt
        const dir = key.endsWith('From') ? 'from' : 'to';

        if (!betweenParams[baseKey]) {
          betweenParams[baseKey] = {};
        }

        betweenParams[baseKey][dir] = value;
        continue;
      }

      filterParams[key] = value;
      topLevelParams[key] = value;
    }

    const defaultInstance = new this.dto();

    // Get the constructor of the filter DTO
    const FilterDto = Reflect.getMetadata('design:type', defaultInstance, 'filter');
    const ExclusionDto = Reflect.getMetadata('design:type', defaultInstance, 'exclusion');
    const BetweenDto = Reflect.getMetadata('design:type', defaultInstance, 'between');

    // Create default filter instance if FilterDto exists
    const defaultFilterInstance = FilterDto ? new FilterDto() : {};
    const defaultExclusionInstance = ExclusionDto ? new ExclusionDto() : {};
    const defaultBetweenInstance = BetweenDto ? new BetweenDto() : {};

    /**
     * add default values then override it with top-level params(not part of filter)
     * then add filter params if any otherwise assign default filter
     */
    const transformedQuery = plainToClass(this.dto, {
      ...defaultInstance,
      ...topLevelParams,
      filter:
        Object.keys(filterParams).length > 0
          ? { ...defaultFilterInstance, ...filterParams }
          : defaultFilterInstance,
      exclusion:
        Object.keys(exclusionParams).length > 0
          ? { ...defaultExclusionInstance, ...exclusionParams }
          : defaultExclusionInstance,
      between:
        Object.keys(betweenParams).length > 0
          ? Object.assign(defaultBetweenInstance, betweenParams)
          : defaultBetweenInstance,
    });

    request.query = transformedQuery;

    return next.handle().pipe(
      map((data) => {
        return data;
      }),
    );
  }
}
