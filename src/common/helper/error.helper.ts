import axios, { AxiosError } from 'axios';
import { ValidationError } from 'class-validator';
import { Logger } from '@nestjs/common';

const logger = new Logger('HttpService');

function handleErrorFormat(errors: ValidationError[]) {
  let formats = [];
  for (const error of errors) {
    let format = { field: error.property, messages: [] };
    if (error.children.length) {
      for (const child of error.children) {
        if (child.children.length) {
          format.messages.push(handleErrorFormat([child.children[0]])[0]);
        } else {
          format.messages.push(handleErrorFormat([child]));
        }
      }
    } else {
      for (const key in error.constraints) {
        if (Object.prototype.hasOwnProperty.call(error.constraints, key)) {
          format.messages.push(error.constraints[key]);
        }
      }
    }
    formats.push(format);
  }
  return formats;
}

export function formatError(errors: ValidationError[]) {
  let formattedError = {
    message: 'Validation failed',
    error: [],
    statusCode: 400,
  };
  formattedError.error.push(...handleErrorFormat(errors));

  return formattedError;
}

export function handleAxiosError(
  message: string,
  err: unknown,
  logFn: (message: string, data: string) => void,
): void {
  if (axios.isAxiosError(err)) {
    const error = err as AxiosError;
    logger.error(`Axios error: ${message}`, JSON.stringify(error));
    if (process.env.NODE_ENV == 'local') {
      console.error(message);
    } else {
      logFn(message, JSON.stringify(error));
    }
  } else {
    throw err;
  }
}
