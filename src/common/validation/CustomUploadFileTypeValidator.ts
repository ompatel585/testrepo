import { FileValidator } from '@nestjs/common';
import { fileTypeFromBuffer } from 'file-type';

export interface CustomUploadTypeValidatorOptions {
  fileType: string[]; // allowed mime types
  fileExtensions: string[]; // allowed file extensions, e.g. ['jpg', 'png']
}

export class CustomUploadFileTypeValidator extends FileValidator {
  private allowedMimeTypes: string[];
  private allowedExtensions: string[];

  constructor(protected readonly validationOptions: CustomUploadTypeValidatorOptions) {
    super(validationOptions);
    this.allowedMimeTypes = validationOptions.fileType;
    this.allowedExtensions = validationOptions.fileExtensions.map(ext =>
      ext.toLowerCase().replace(/^\./, ''), // normalize
    );
  }

  public async isValid(file?: Express.Multer.File): Promise<boolean> {
    if (!file || !file.buffer) {
      return false;
    }

    const result = await fileTypeFromBuffer(file.buffer);
    if (!result?.mime || !result.ext) {
      return false;
    }

    // check mime
    if (!this.allowedMimeTypes.includes(result.mime)) {
      return false;
    }

    // check extension
    const fileExt = result.ext.toLowerCase();
    if (!this.allowedExtensions.includes(fileExt)) {
      return false;
    }

    return true;
  }

  public buildErrorMessage(): string {
    return `accepted formats: ${this.allowedExtensions.join(', ')} or file is invalid`;
  }
}
