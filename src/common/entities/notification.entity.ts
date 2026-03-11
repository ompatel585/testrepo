import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  RelationId,
} from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { NotificationType } from './notificationType.entity';
import { User } from './user.entity';
import { NotificationDelivery } from './notificationDelivery.entity';

@Entity()
@Check(`"isRead" IN (0, 1)`)
export class Notification extends AbstractEntity<Notification> {
  @Column({ type: 'jsonb' })
  data: Object;

  @ManyToOne(() => NotificationType)
  @JoinColumn()
  type: NotificationType;

  @OneToMany(
    () => NotificationDelivery,
    (notificationDelivery) => notificationDelivery.notification,
  )
  notificationDelivery: NotificationDelivery[];

  @ManyToOne(() => User)
  @JoinColumn()
  user: User;

  @Column({ nullable: false })
  @RelationId((notification: Notification) => notification.user)
  userId: number;

  @Column('smallint', { default: 0 })
  isRead: number;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
