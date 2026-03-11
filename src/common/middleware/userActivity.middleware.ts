import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { UserActivityService } from 'src/user-activity/userActivity.service';

@Injectable()
export class UserActivityMiddleware implements NestMiddleware {
  private readonly logger = new Logger(UserActivityMiddleware.name);

  constructor(private readonly userActivityService: UserActivityService) {}

  use(req: Request, res: Response, next: NextFunction) {
    // Only proceed if user is authenticated
    if (req.user) {
      // You might want to filter certain routes
      const path = req.path;
      if (!path.includes('/health') && !path.includes('/metrics')) {
        try {
          this.userActivityService
            .trackActivity(req, (req.user as any).id, 'pageView')
            .catch((error) => {
              this.logger.warn(`Failed to track page view: ${error.message}`);
              console.error('Activity tracking failed in middleware:', error.message);
            });
        } catch (error) {
          this.logger.warn(`Exception in activity middleware: ${error.message}`);
          console.error('Activity middleware exception:', error.message);
        }
      }
    }
    // Always call next() to continue processing the request
    next();
  }
}
