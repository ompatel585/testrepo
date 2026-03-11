import { InjectRepository } from '@nestjs/typeorm';
import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { User } from '../entities/user.entity';
import { EntityManager, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';

export type IsUniqueConstraintInput = {
  tableName: string;
  column: string;
  where?: { [key: string]: string }[];
  caseInsensitive?: boolean;
};

export type IsUniqueConstraintOptions =
  | IsUniqueConstraintInput
  | ((obj: any) => IsUniqueConstraintInput);

@ValidatorConstraint({ async: true })
@Injectable()
export class IsAlreadyExistConstraint implements ValidatorConstraintInterface {
  // constructor(private usersService: UsersService) {}
  constructor(private readonly entityManager: EntityManager) {}

  async validate(value: any, args: ValidationArguments) {
    const constraint = args.constraints[0] as IsUniqueConstraintOptions;
    const {
      tableName,
      column,
      where = [],
      caseInsensitive = false,
    }: IsUniqueConstraintInput = typeof constraint === 'function'
      ? constraint(args.object)
      : constraint;

    if (value === null || value === undefined) {
      return true;
    }

    const qb = await this.entityManager
      .getRepository(tableName)
      .createQueryBuilder(tableName);

    if (caseInsensitive) {
      qb.where(`LOWER(${tableName}.${column}) = LOWER(:value)`, { value });
    } else {
      qb.where({ [column]: value });
    }

    where.forEach((cond) => {
      qb.andWhere(cond);
    });

    const queryBuilder = await qb.getExists();

    return queryBuilder ? false : true;
  }

  defaultMessage(args: ValidationArguments) {
    const { caseInsensitive = false }: IsUniqueConstraintInput = args.constraints[0];
    const suffix = caseInsensitive ? ' (case-insensitive)' : '';
    return `( $value ) already exists${suffix}`;
  }
}

export function IsAlreadyExist(
  options: IsUniqueConstraintOptions,
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [options],
      validator: IsAlreadyExistConstraint,
    });
  };
}
