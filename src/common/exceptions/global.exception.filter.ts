import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Injectable,
} from '@nestjs/common';
import { CloudLoggerService } from 'src/cloud-logger/cloud-logger.service';
import { Request, Response } from 'express';
import { sanitizeObject } from '../helper/object.helper';

@Catch()
@Injectable()
export class GlobalExceptionsFilter implements ExceptionFilter {
  constructor(private cloudLoggerService: CloudLoggerService) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception instanceof HttpException ? exception.getStatus() : 500;
    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal Server Error';

    if (status === 500) {
      const sensitiveKeys = [
        'password',
        'token',
        'authorization',
        'cookie',
        'newPassword',
        'fcmToken',
        'otp',
      ];

      const errorLog = {
        path: request.url,
        method: request.method,
        timestamp: new Date().toISOString(),
        stack: exception instanceof Error ? exception.stack : exception,
        query: sanitizeObject(request.query, sensitiveKeys),
        params: sanitizeObject(request.params, sensitiveKeys),
        body: sanitizeObject(request.body, sensitiveKeys),
        user: sanitizeObject(request.user ?? null, sensitiveKeys),
      };
      if (process.env.NODE_ENV == 'local') {
        console.log('global error', errorLog);
      } else {
        this.cloudLoggerService.error(
          'Internal Server Error',
          JSON.stringify(errorLog),
          1,
        );
      }
    }

    response.status(status).json(message);
  }
}
