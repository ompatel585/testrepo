import { Like, SelectQueryBuilder } from 'typeorm';
import { QueryParamsDto } from '../dto/query-params.dto';
import { BusinessException } from '../exceptions/business.exception';
import { INVALID_FILTER } from '../json/error-messages.json';

type aliasObject = { key: string; alias: string };
export type SearchItem = string | aliasObject;
interface FilterQueryBuilderParams<T> {
  queryParams: QueryParamsDto & { sortBy: string };
  queryBuilder: SelectQueryBuilder<T>;
  searchKeys?: SearchItem[];
  filters?: Record<string, any>;
  exclusions?: Record<string, any>;
  columnTypes?: Record<string, any>;
  hasMore?: boolean;
  between?: Record<string, any>;
}

export const filterQueryBuilder = <T>({
  queryParams,
  queryBuilder,
  searchKeys,
  filters,
  exclusions,
  columnTypes,
  hasMore = false,
  between,
}: FilterQueryBuilderParams<T>) => {
  // Add filter conditions if provided
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        try {
          const field = key.includes('.')
            ? key
                .split('.') // split into parts by dot
                .map((part) => `"${part}"`) // wrap each part in quotes
                .join('.')
            : `"${queryBuilder.alias}"."${key}"`;

          if (columnTypes && columnTypes[key] === 'array') {
            /**
             * Adds a condition to check if an array column contains a specific value
             * using PostgreSQL's `@>` (array containment) operator.
             * This ensures that the specified field (an array column) includes the given value,
             * filtering results where the array contains the provided key.
             */
            if (typeof value === 'string' || typeof value === 'number') {
              queryBuilder.andWhere(`${field}::text[] @> ARRAY[:${key}]::text[] `, {
                [key]: value.toString(), // array table column and scalar value
              });
            } else if (Array.isArray(value)) {
              // WHERE field && ARRAY[value]
              queryBuilder.andWhere(`${field}::text[] && ARRAY[:...${key}]::text[]`, {
                [key]: value.map((v) => v.toString()),
              });
            }
          } else if (Array.isArray(value)) {
            // Handle array filter
            queryBuilder.andWhere(`${field} IN (:...${key})`, {
              [key]: value,
            });
          } else {
            // Handle scalar value
            queryBuilder.andWhere(`${field} = :${key}`, {
              [key]: value,
            });
          }
        } catch (error) {
          console.error('query filter error=>', error);
          throw new BusinessException(INVALID_FILTER);
        }
      } else if (value == null) {
        // Handle null values
        const field = key.includes('.') ? key : `${queryBuilder.alias}.${key}`;
        queryBuilder.andWhere(`${field} IS NULL`);
      }
    });
  }

  // Add exclusion conditions if provided

  if (exclusions) {
    Object.entries(exclusions).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        try {
          if (Array.isArray(value)) {
            // Handle array exclusions
            queryBuilder.andWhere(`${queryBuilder.alias}.${key} NOT IN (:...${key})`, {
              [`${key}`]: value,
            });
          } else {
            // Handle single value exclusion
            queryBuilder.andWhere(`${queryBuilder.alias}.${key} != :${key}`, {
              [`${key}`]: value,
            });
          }
        } catch (error) {
          console.error('Query exclusion error:', error);
        }
      } else if (value == null) {
        // Handle null values
        const field = key.includes('.') ? key : `${queryBuilder.alias}.${key}`;
        queryBuilder.andWhere(`${field} IS NOT NULL`);
      }
    });
  }

  // Add search conditions if searchKeys and search query are provided
  if (searchKeys && queryParams.search) {
    const searchConditions = searchKeys.map((key) => {
      if (typeof key == 'string') {
        return `CAST(${queryBuilder.alias}.${key} AS TEXT) ILIKE :search`;
      }
      return `CAST(${key.alias}.${key.key} AS TEXT) ILIKE :search`;
    });
    const searchQuery = searchConditions.join(' OR ');
    queryBuilder.andWhere(`(${searchQuery})`, {
      search: `%${queryParams.search.toLowerCase()}%`,
    });
  }

  // Add sorting conditions
  if (queryParams.sortBy && queryParams.sortOrder) {
    queryBuilder.orderBy(
      queryParams.sortBy.includes('.')
        ? queryParams.sortBy
        : `${queryBuilder.alias}.${queryParams.sortBy}`,
      queryParams.sortOrder,
    );
  }

  // Add pagination conditions
  if (queryParams.page && queryParams.limit && queryParams.limit > 0) {
    queryBuilder
      .skip((queryParams.page - 1) * queryParams.limit)
      .take(hasMore ? queryParams.limit + 1 : queryParams.limit);
  }

  // Add between conditions
  if (between) {
    Object.entries(between).forEach(([key, range]) => {
      if (!range) return;

      const field = `"${queryBuilder.alias}"."${key}"`;

      if (range.from) {
        const fromDate = new Date(range.from);
        fromDate.setHours(0, 0, 0, 0);

        queryBuilder.andWhere(`${field} >= :${key}From`, {
          [`${key}From`]: fromDate,
        });
      }

      if (range.to) {
        const toDate = new Date(range.to);
        toDate.setHours(23, 59, 59, 999);

        queryBuilder.andWhere(`${field} <= :${key}To`, {
          [`${key}To`]: toDate,
        });
      }
    });
  }

  return queryBuilder;
};
