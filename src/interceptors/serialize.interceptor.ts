import {
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  UseInterceptors,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { plainToInstance } from 'class-transformer';

interface ClassConstructor<T> {
  new (...args: any[]): T;
}

export function Serialize<T>(dto: ClassConstructor<T>) {
  return UseInterceptors(new SerializeInterceptor(dto));
}

@Injectable()
export class SerializeInterceptor<T> implements NestInterceptor {
  private readonly logger = new Logger(SerializeInterceptor.name);

  constructor(private dto: ClassConstructor<T>) {}

  intercept(
    context: ExecutionContext,
    handler: CallHandler,
  ): Observable<T> | Promise<Observable<T>> {
    return handler.handle().pipe(
      map((data: any) => {
        if (Array.isArray(data)) {
          return data.map((item) =>
            plainToInstance(this.dto, item, {
              excludeExtraneousValues: true,
            }),
          );
        }
        return plainToInstance(this.dto, data, {
          excludeExtraneousValues: true,
        });
      }),
      catchError((err) => {
        this.logger.error('Error occurred during serialization', err.stack);
        throw err; // rethrow the error
      }),
    ) as Observable<T> | Promise<Observable<T>>; // Specify the return type
  }
}
