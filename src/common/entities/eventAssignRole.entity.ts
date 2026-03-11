import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EventSubmission } from 'src/common/entities/eventSubmission.entity';
import { EventRating, JuryRole } from './eventRating.entity';
import { EventCourseCategory } from './eventCourseCategories.entity';
import { Event } from './event.entity';

export enum RatingStatusEnum {
  NOT_RATED = 'nonRated',
  RATED = 'rated',
}
@Entity('event_assign_rate')
export class EventAssignToRate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: JuryRole,
  })
  juryType: JuryRole;

  @Column({
    type: 'enum',
    enum: RatingStatusEnum,
    default: RatingStatusEnum.NOT_RATED,
  })
  ratingStatus: RatingStatusEnum;

  @Column({ nullable: true })
  juryId: string;

  @Column()
  submissionId: number;

  @ManyToOne(() => EventSubmission, (submission) => submission.id)
  @JoinColumn({ name: 'submissionId' })
  submission: EventSubmission;


  @Column()
  categoryId: number;

  @Column()
  eventId: number;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({
    nullable: true,
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
