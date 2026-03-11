import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Unique, ManyToOne, JoinColumn } from 'typeorm';
import { EventSubmission } from './eventSubmission.entity';
import { EventRating } from './eventRating.entity';

@Entity('event_winners')
@Unique(['submissionId', 'categoryId', 'eventId', 'studentId', 'ratingId'])
export class EventWinner {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    ratingId: number;

    @ManyToOne(() => EventRating, (rating) => rating.id)
    @JoinColumn({ name: 'ratingId' })
    rating: EventRating;

    @Column()
    studentId: string;

    @Column()
    submissionId: number;

    @ManyToOne(() => EventSubmission, (submission) => submission.id)
    @JoinColumn({ name: 'submissionId' })
    submission: EventSubmission;

    @Column()
    categoryId: number;

    @Column()
    eventId: number;

    @Column({ type: 'smallint', default: 0 })
    winner: number;

    @Column({ type: 'smallint', default: 0 })
    runnerUp: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
