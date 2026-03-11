import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  Unique,
  OneToOne,
} from 'typeorm';
import { Event } from './event.entity';
import { EventSubmission } from './eventSubmission.entity';
import { EventWinner } from './event-winner.entity';

export enum JuryRole {
  INTERNAL = 'intJury',
  EXTERNAL = 'extJury',
}

export enum RatingStatus {
  SUBMIT = 'Submit',
  REJECT = 'Reject',
  PUBLISH = 'Publish',
}
@Unique(['studentId', 'submissionId', 'juryId', 'eventId'])
@Entity({ name: 'event_rating' })
export class EventRating {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => EventWinner, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ratingId' })
  winner: EventWinner;

  @Column()
  eventId: number;

  @ManyToOne(() => Event, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'eventId' })
  event: Event;

  @Column()
  studentId: string;

  @Column()
  juryId: string;

  @Column({
    type: 'enum',
    enum: JuryRole,
  })
  juryRole: JuryRole;

  @Column()
  submissionId: number;

  @Column()
  categoryId: number;

  @ManyToOne(() => EventSubmission, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'submissionId' })
  submission: EventSubmission;

  @Column({ nullable: true })
  aiRating: number | null;

  @Column({ nullable: true })
  aiPlagiarised: number | null;

  @Column({ nullable: true })
  rating: number;

  @Column({ nullable: true })
  feedback: string;

  @Column({ type: 'boolean', default: false })
  wishlist: boolean;

  @Column({ type: 'boolean', default: false })
  wildcard: boolean;

  @Column({ type: 'boolean', default: false })
  zap: boolean;

  @Column({
    type: 'enum',
    enum: RatingStatus,
    nullable: true,
  })
  status: RatingStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
