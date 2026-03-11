import {
  Injectable,
  CanActivate,
  ExecutionContext,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CourseService } from 'src/course/course.service';
import { DefaultUserResponse } from '../strategy/jwt.strategy';

@Injectable()
export class BookAccessGuard implements CanActivate {
  constructor(
    private readonly courseService: CourseService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const moduleId = Number(request.params?.moduleId || request.params?.id);
    if (isNaN(moduleId)) {
      throw new NotFoundException();
    }
    return await this.courseService.userHasAccessToBook(
      request.user as DefaultUserResponse,
      moduleId,
    );
  }
}
