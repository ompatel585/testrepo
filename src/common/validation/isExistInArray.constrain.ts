import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';

interface ValidationConfig {
  tables: Array<{
    tableName: string; // The table to check
    columns: string[]; // columns to validate
    columnMapping?: Record<string, string>;
  }>;
}

@ValidatorConstraint({ async: true })
@Injectable()
export class IsExistInArrayConstraint implements ValidatorConstraintInterface {
  private validationErrors: string[] = []; // Accumulate errors here
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource, // Injecting DataSource instead
  ) {}

  async validate(value: any[], args: ValidationArguments): Promise<boolean> {
    const config: ValidationConfig = args.constraints[0];
    this.validationErrors = [];

    if (!this.dataSource) {
      throw new InternalServerErrorException();
    }

    for (const tableConfig of config.tables) {
      const repository: Repository<any> = this.dataSource.getRepository(
        tableConfig.tableName,
      );

      if (Array.isArray(value)) {
        for (const item of value) {
          const whereConditions: Record<string, any> = {};

          // **Case 1: Single ID validation (e.g., [1, 2, 3])**
          if (typeof item === 'number' || typeof item === 'string') {
            // Assume 'id' column for single ID validation if no mapping is provided
            const column = tableConfig.columns[0] || 'id';
            whereConditions[column] = item;
            const record = await repository.findOne({ where: whereConditions });
            if (!record) {
              this.validationErrors.push(`No element found with ${column}: ${item}`);
            }
          }
          // Case 2 & 3: Object validation (either single column or multiple columns)
          else if (typeof item === 'object' && item !== null) {
            // Map request keys to database column names (if columnMapping is provided)
            for (const column of tableConfig.columns) {
              const requestKey = tableConfig.columnMapping
                ? Object.keys(tableConfig.columnMapping).find(
                    (key) => tableConfig.columnMapping[key] === column,
                  ) || column
                : column;

              if (!(requestKey in item)) {
                this.validationErrors.push(
                  `Missing required key "${requestKey}" in validation object: ${JSON.stringify(item)}`,
                );
                return false;
              }

              whereConditions[column] = item[requestKey];
            }

            const record = await repository.findOne({ where: whereConditions });
            if (!record) {
              this.validationErrors.push(
                `This match does not exist in "${tableConfig.tableName}": ${this.formatItem(item)}`,
              );
              return false;
            }
          }
          // Invalid item type
          else {
            this.validationErrors.push(
              `Invalid item type in validation array: ${this.formatItem(item)}`,
            );
            return false;
          }
        }
      }
    }

    return true; // All validations passed
  }

  private formatItem(item: any): string {
    // Convert the object to a string without the slashes
    return Object.keys(item)
      .map((key) => `${key}: ${item[key]}`)
      .join(', ');
  }

  defaultMessage(args: ValidationArguments): string {
    // Return all collected errors as a single string
    return this.validationErrors.length > 0
      ? this.validationErrors.join('; ')
      : `Invalid data in ${args.property}`;
  }
}

export function IsExistInArray(
  config: ValidationConfig, // Validation configuration
  validationOptions?: ValidationOptions, // Optional class-validator options
) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [config],
      validator: IsExistInArrayConstraint,
    });
  };
}

/**
 * How to use?
 */

/**
 * Validates whether the provided values exist in the database according to the given configuration.
 *
 * Scenarios:
 * 1. **Only IDs (Single Table, Single Column)**:
 *    - Validates a simple array of IDs (e.g., [1, 2, 3, 4]) against a single column in a single table.
 *    - Example:
 *      ValidationConfig:
 *      {
 *        tables: [{ tableName: 'categories', columns: ['id'] }]
 *      }
 *      Input:
 *      [1, 2, 3, 4]
 *
 * 2. **Single Column Objects (Single Table)**:
 *    - Validates an array of objects with one key (e.g., [{ brandId: 1 }, { brandId: 3 }]) against a single column in a table.
 *    - Example:
 *      ValidationConfig:
 *      {
 *        tables: [{ tableName: 'brands', columns: ['id'], columnMapping: { brandId: 'id' } }]
 *      }
 *      Input:
 *      [{ brandId: 1 }, { brandId: 3 }]
 *
 * 3. **Multiple Columns in a Single Table**:
 *    - Validates objects with 2 or more keys (e.g., [{ categoryId: 2, brandId: 1 }]) against multiple columns in the same table.
 *    - Example:
 *      ValidationConfig:
 *      {
 *        tables: [
 *          {
 *            tableName: 'brand_category',
 *            columns: ['categoryId', 'brandId'],
 *            columnMapping: { categoryId: 'id/categoryId', brandId: 'brandId' }
 *          }
 *        ]
 *      }
 *      Input:
 *      [{ categoryId: 2, brandId: 1 }]
 *
 * 4. **Different Columns from Different Tables**:
 *    - Validates objects where each key maps to a column in a different table (e.g., [{ categoryId: 2, brandId: 1 }]).
 *    - Example:
 *      ValidationConfig:
 *      {
 *        tables: [
 *          { tableName: 'categories', columns: ['id'], columnMapping: { categoryId: 'id' } },
 *          { tableName: 'brands', columns: ['id'], columnMapping: { brandId: 'id' } }
 *        ]
 *      }
 *      Input:
 *      [{ categoryId: 2, brandId: 1 }]
 */
