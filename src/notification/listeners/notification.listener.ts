import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import {
  AddNotification,
  AddNotificationEvent,
  SendNotification,
  SendNotificationEvent,
} from '../events/notification.event';
import { NotificationService } from '../notification.service';
import { CloudLoggerService } from 'src/cloud-logger/cloud-logger.service';

@Injectable()
export class NotificationListener {
  private readonly logger = new Logger('NotificationListener');

  constructor(
    private notificationService: NotificationService,
    private eventEmitter: EventEmitter2,
    private cloudLoggerService: CloudLoggerService,
  ) {}

  @OnEvent(AddNotification)
  async addNotification(payload: AddNotificationEvent) {
    try {
      const notification = await this.notificationService.create(payload);
      this.eventEmitter.emit(
        SendNotification,
        new SendNotificationEvent({ notificationId: notification.id }),
      );
    } catch (error) {
      this.logger.log('Failed addNotification listener', error);
      this.cloudLoggerService.error('Failed addNotification listener', error.stack);
    }
  }

  @OnEvent(SendNotification)
  async sendNotification(payload: SendNotificationEvent) {
    try {
      await this.notificationService.sendNotification(payload.notificationId);
    } catch (error) {
      this.logger.log('Failed sendNotification listener', error);
      this.cloudLoggerService.error('Failed sendNotification listener', error.stack);
    }
  }
}
