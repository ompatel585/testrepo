import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  validateSync,
} from 'class-validator';
import {
  answerMustString,
  answerMustStringArray,
  MultiTrueFalseOption,
  Quiz,
  QuizTypeEnum,
} from 'src/admin/book/dto/edit-book.dto';

@ValidatorConstraint({ async: false })
class IsStringOrQuizArrayConstraint implements ValidatorConstraintInterface {
  isString(value: unknown): value is string {
    return typeof value === 'string';
  }

  isStringArray(value: unknown): value is string[] {
    return Array.isArray(value) && value.every((item) => typeof item === 'string');
  }

  validate(value: any, args: ValidationArguments): boolean {
    if (typeof value === 'string') {
      return true; // Valid if it's a string
    }

    if (Array.isArray(value)) {
      // Check if every element in the array is a valid Quiz object
      return value.every((item) => {
        if (typeof item !== 'object') return false;
        const errors = validateSync(Object.assign(new Quiz(), item));
        if (answerMustString.includes(item.type) && !this.isString(item.answer)) {
          return false;
        }
        if (
          answerMustStringArray.includes(item.type) &&
          !this.isStringArray(item.answer)
        ) {
          return false;
        }
        if (item.type == QuizTypeEnum.MultiTrueOrFalse) {
          for (const opt of item.options) {
            if (typeof opt !== 'string') {
              return false;
            }
          }
        }
        return errors.length === 0; // Valid if no validation errors
      });
    }

    return false; // Invalid if not a string or an array of Quiz
  }

  defaultMessage(args: ValidationArguments): string {
    return `invalid value`;
  }
}

export function IsStringOrQuizArray(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsStringOrQuizArrayConstraint,
    });
  };
}
