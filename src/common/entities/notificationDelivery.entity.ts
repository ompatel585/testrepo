import { Entity, Column, ManyToOne, JoinColumn, RelationId } from 'typeorm';
import { DeliveryType } from './deliveryType.entity';
import { NotificationDeliveryStatus } from './notificationDeliveryStatus.entity';
import { Notification } from './notification.entity';
import { AbstractEntity } from './abstract.entity';

@Entity()
export class NotificationDelivery extends AbstractEntity<NotificationDelivery> {
  @Column({ type: 'timestamp', nullable: true })
  deliverTime: Date;

  @ManyToOne(() => DeliveryType, (deliveryType) => deliveryType.id)
  // @JoinColumn({ name: 'deliveryTypeId' })
  deliveryType: DeliveryType;

  @Column({ nullable: false })
  @RelationId(
    (notificationDelivery: NotificationDelivery) => notificationDelivery.deliveryType,
  )
  deliveryTypeId: number;

  @ManyToOne(() => NotificationDeliveryStatus)
  @JoinColumn({ name: 'statusId' })
  status: NotificationDeliveryStatus;

  @Column({ nullable: false })
  @RelationId((notificationDelivery: NotificationDelivery) => notificationDelivery.status)
  statusId: number;

  @ManyToOne(() => Notification, (notification) => notification.notificationDelivery)
  @JoinColumn({ name: 'notificationId' })
  notification: Notification;
}
