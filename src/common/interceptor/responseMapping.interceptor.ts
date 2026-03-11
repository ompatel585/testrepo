import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { ResponseHelper } from '../helper/response.helper';

export interface ResponseInterface<T> {
  data: T;
  count?: number;
}

@Injectable()
export class ResponseMappingInterceptor<T>
  implements NestInterceptor<T, ResponseInterface<T>>
{
  // intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
  //   return next.handle().pipe(
  //     map((data: ResponseHelper<T>) => {
  //       {
  //         let responseStructure = {
  //           data: null,
  //           success: true,
  //           message: 'ok',
  //           errors: [],
  //           statusCode: context.switchToHttp().getResponse().statusCode,
  //         };
  //         if (data && typeof data == 'object' && 'data' in data) {
  //           if (Array.isArray(data.data)) {
  //             if ('count' in data) {
  //               responseStructure.data = {
  //                 items: [...data.data],
  //                 count: data.count,
  //                 ...data.restParams,
  //               };
  //             } else {
  //               responseStructure.data = { items: [...data.data] };
  //             }
  //           } else {
  //             responseStructure.data = { item: data.data };
  //           }
  //         } else {
  //           responseStructure.data = data || {};
  //         }
  //         return responseStructure;
  //       }
  //     }),
  //   );
  // }
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data: ResponseHelper<T>) => {
        if (
          data &&
          typeof data === 'object' &&
          'data' in data &&
          'success' in data &&
          'message' in data &&
          'statusCode' in data
        ) {
          return data;
        }

        const responseStructure = {
          data: null,
          success: true,
          message: 'ok',
          errors: [],
          statusCode: context.switchToHttp().getResponse().statusCode,
        };

        if (data && typeof data === 'object' && 'data' in data) {
          if (Array.isArray(data.data)) {
            if ('count' in data) {
              responseStructure.data = {
                items: [...data.data],
                count: data.count,
                ...data.restParams,
              };
            } else {
              responseStructure.data = { items: [...data.data] };
            }
          } else {
            responseStructure.data = { item: data.data };
          }
        } else {
          responseStructure.data = data || {};
        }

        return responseStructure;
      }),
    );
  }

  // intercept(context: ExecutionContext, next: CallHandler): any {
  //   console.log('inside response inter');
  //   const request = context.switchToHttp().getRequest();
  //   const method = request.method;

  //   let statusCode: number;

  //   switch (method) {
  //     case 'POST':
  //       statusCode = 201;
  //       break;
  //     case 'DELETE':
  //       statusCode = 204;
  //       break;
  //     default:
  //       statusCode = 200;
  //       break;
  //   }

  //   return next.handle().pipe(
  //     map((data) => {
  //       console.log(data, data.length);
  //       if (method == 'PATCH' || method == 'DELETE' || method == 'PUT') {
  //         data = [];
  //       } else {
  //         console.log('length here:', data.length);
  //         if (Array.isArray(data)) {
  //           data = { items: [...data] };
  //         } else {
  //           data = { item: data };
  //         }
  //       }
  //       return { data, status: statusCode, success: true, message: 'ok', errors: [] };
  //     }),
  //   );
  // }
}
