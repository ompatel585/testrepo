import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';

@Entity('event_points')
@Unique(['centerId', 'eventId'])
export class EventPoint {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  centerId: number;

  @Column({ nullable: true })
  eventId?: number;

  @Column({ type: 'json' })
  points: {
    registration: number;
    submission: number;
    creativeMinds: number;
    nomination: number;
    runnerUp: number;
    winner: number;
  }

  rank?: number;

  @CreateDateColumn()
  created: Date;

  @UpdateDateColumn()
  updated: Date;
}