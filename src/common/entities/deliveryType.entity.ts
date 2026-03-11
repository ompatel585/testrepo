import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { NotificationDelivery } from './notificationDelivery.entity';

export enum DeliveryTypeEnum {
  Email = 'email',
  WebApp = 'webApp',
  MobileApp = 'mobileApp',
  SMS = 'sms',
}

export enum DeliveryTypeValueEnum {
  Email = 1,
  WebApp = 2,
  MobileApp = 3,
  SMS = 4,
}

@Entity()
export class DeliveryType extends AbstractEntity<DeliveryType> {
  @Column({
    type: 'enum',
    enum: DeliveryTypeEnum,
    unique: true,
  })
  type: string;
}
