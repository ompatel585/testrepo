import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  OneToOne,
  ManyToOne,
} from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { Event } from './event.entity';

@Entity()
export class EventStatus extends AbstractEntity<EventStatus> {
  @ManyToOne(() => Event, (event) => event.id)
  @JoinColumn()
  event: Event;

  @Column({ nullable: false })
  status: string;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
