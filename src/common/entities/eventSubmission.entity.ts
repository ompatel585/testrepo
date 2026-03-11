import { Column, Entity, JoinColumn, OneToMany, Unique } from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { ArtworkDto } from 'src/event/dto/create-event-submission.dto';
import { EventRating } from './eventRating.entity';

export enum SubmissionFileType {
  PDF = 'pdf',
  IMAGE = 'image',
  VIDEO = 'video',
  YOUTUBE = 'youtube',
}

export enum SubmissionStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submited',
  REJECTED = 'rejected',
}

@Unique(['categoryId', 'studentId', 'eventId', 'centreId'])
@Entity()
export class EventSubmission extends AbstractEntity<EventSubmission> {
  @OneToMany(() => EventRating, (rating) => rating.submission)
  ratings: EventRating[];

  @Column()
  categoryId: number;

  @Column()
  courseCode: string;

  @Column()
  studentId: string;

  @Column()
  studentEmail: string;

  @Column()
  eventId: number;

  @Column()
  thumbnail: string;

  @Column({ type: 'json' })
  artworks: ArtworkDto[];

  @Column({
    type: 'enum',
    enum: SubmissionStatus,
    nullable: true,
    default: SubmissionStatus.DRAFT,
  })
  submissionStatus: SubmissionStatus;

  @Column({ nullable: true })
  centreId: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
