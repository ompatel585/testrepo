import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Event } from './event.entity';

@Entity('event_user')
export class EventUser {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: string;

  @Column({ nullable: true })
  centerId: number;

  @Column()
  eventId: number;

  @Column({nullable: true})
  courseCode: string;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'userId', referencedColumnName: 'userId' })
  user: User;

  @ManyToOne(() => Event, { eager: false })
  @JoinColumn({ name: 'eventId' })
  event: Event;
}
