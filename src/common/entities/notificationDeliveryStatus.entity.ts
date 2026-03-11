import { Column, Entity, OneToMany } from 'typeorm';
import { AbstractEntity } from './abstract.entity';

export enum NotificationDeliveryStatusEnum {
  Init = 'init',
  Success = 'success',
  Failed = 'failed',
}

export enum NotificationDeliveryStatusValueEnum {
  Init = 1,
  Success = 2,
  Failed = 3,
}

@Entity()
export class NotificationDeliveryStatus extends AbstractEntity<NotificationDeliveryStatus> {
  @Column({
    type: 'enum',
    enum: NotificationDeliveryStatusEnum,
    default: NotificationDeliveryStatusEnum.Init,
  })
  status: string;
}
