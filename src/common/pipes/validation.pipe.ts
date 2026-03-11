import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { ValidationError, ValidatorOptions, validate } from 'class-validator';
import { plainToClass, plainToInstance } from 'class-transformer';
import { formatError } from '../helper/error.helper';
import { ValidationPipe as InBuildValidationPipe } from '@nestjs/common';

@Injectable()
export class ValidationPipe extends InBuildValidationPipe {
  protected async validate(
    object: object,
    validatorOptions?: ValidatorOptions,
  ): Promise<ValidationError[]> {
    const errors = await validate(object, validatorOptions);
    if (errors.length > 0) {
      throw new BadRequestException(formatError(errors));
    }
    return errors;
  }
}
