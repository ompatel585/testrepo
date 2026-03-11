import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

const DefaultExtension = ['.jpg', '.jpeg', '.png'];

export function IsValidFileExtension(
  allowedExtensions?: string[],
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'IsValidFileExtension',
      target: object.constructor,
      propertyName: propertyName,
      constraints: allowedExtensions || [],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'string') {
            return false;
          }

          const extensions =
            Array.isArray(args.constraints) && args.constraints.length > 0
              ? args.constraints
              : DefaultExtension;

          return extensions.some((ext: string) =>
            value.toLowerCase().endsWith(ext),
          );
        },
        defaultMessage(args: ValidationArguments) {
          const extensions =
            Array.isArray(args.constraints) && args.constraints.length > 0
              ? args.constraints
              : DefaultExtension;

          return `File must have one of the following extensions: ${extensions.join(', ')}`;
        },
      },
    });
  };
}
