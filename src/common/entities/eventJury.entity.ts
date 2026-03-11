import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { JuryRole } from './eventRating.entity';
import { User } from './user.entity';

@Entity('event_jury')
export class EventJury {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: string;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'userId', referencedColumnName: 'userId' })
  user: User;

  @Column()
  eventId: number;

  @Column({
    type: 'enum',
    enum: JuryRole,
  })
  juryRole: JuryRole;

  @Column()
  expertsIn: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
