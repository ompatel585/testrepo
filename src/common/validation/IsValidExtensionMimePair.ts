import {
    registerDecorator,
    ValidationOptions,
    ValidationArguments,
  } from 'class-validator';
  
  const extensionMimeMap: Record<string, string> = {
    '.mp4': 'video/mp4',
    '.avi': 'video/x-msvideo',
    '.mkv': 'video/x-matroska',
    '.pdf': 'application/pdf',
    '.zip': 'application/zip',
    '.rar': 'application/x-rar-compressed',
    '.7z': 'application/x-7z-compressed',
  };
  
  export function IsValidExtensionMimePair(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
      registerDecorator({
        name: 'IsValidExtensionMimePair',
        target: object.constructor,
        propertyName,
        options: validationOptions,
        validator: {
          validate(_: any, args: ValidationArguments) {
            const obj: any = args.object;
            const { fileName, contentType } = obj;
  
            if (typeof fileName !== 'string' || typeof contentType !== 'string') {
              return false;
            }
  
            const ext = Object.keys(extensionMimeMap).find((key) =>
              fileName.toLowerCase().endsWith(key),
            );
  
            if (!ext) return false;
  
            return extensionMimeMap[ext] === contentType;
          },
  
          defaultMessage(args: ValidationArguments) {
            return 'fileName and contentType do not match. Ensure file extension and MIME type are valid and consistent.';
          },
        },
      });
    };
  }
  