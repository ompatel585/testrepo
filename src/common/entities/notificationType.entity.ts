import { Column, Entity } from 'typeorm';
import { AbstractEntity } from './abstract.entity';

export enum NotificationTypeEnum {
  SOCIAL = 'social',
  PLACEMENT = 'placement',
  DIGITAL_CONTENT = 'digitalContent',
  AUTH = 'auth',
}

export enum NotificationTypeValueEnum {
  SOCIAL = 1,
  PLACEMENT = 2,
  DIGITAL_CONTENT = 3,
  AUTH = 4,
}

@Entity()
export class NotificationType extends AbstractEntity<NotificationType> {
  @Column({
    type: 'enum',
    enum: NotificationTypeEnum,
  })
  type: NotificationTypeEnum;
}
