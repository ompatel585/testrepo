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
  whereIn?: { col: string; val: string[] | number[] }[];
  whereOf?: { col: string; val: string | number }[];
};

@ValidatorConstraint({ async: true })
@Injectable()
export class IsExistConstraint implements ValidatorConstraintInterface {
  // constructor(private usersService: UsersService) {}
  constructor(private readonly entityManager: EntityManager) {}

  async validate(value: any, args: ValidationArguments) {
    const {
      tableName,
      column,
      where = [],
      whereIn = [],
      whereOf = [],
    }: IsUniqueConstraintInput = args.constraints[0];

    const exists = await this.entityManager
      .getRepository(tableName)
      .createQueryBuilder(tableName)
      .where({ [column]: value });

    where.forEach((cond) => {
      exists.andWhere(cond);
    });

    whereIn.forEach((cond) => {
      exists.andWhere(`${cond.col} IN (...${cond.val})`);
    });

    whereOf.forEach((cond) => {
      exists.andWhere(`${cond.col}::text[] @> ARRAY['${cond.val}']::text[]`);
    });

    const queryBuilder = await exists.getExists();

    return queryBuilder ? true : false;
  }

  defaultMessage(args: ValidationArguments) {
    // here you can provide default error message if validation failed
    return '( $value ) not exists';
  }
}

export function IsExist(
  options: IsUniqueConstraintInput,
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [options],
      validator: IsExistConstraint,
    });
  };
}
