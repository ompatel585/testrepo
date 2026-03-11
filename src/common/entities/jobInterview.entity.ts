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

import { User } from './user.entity';
import { AbstractEntity } from './abstract.entity';
import { Datetime } from 'aws-sdk/clients/costoptimizationhub';
import { Job } from './job.entity';

@Entity()
export class JobInterview extends AbstractEntity<JobInterview> {
  @ManyToOne(() => User, (user) => user.id)
  user: User;

  @Column({ nullable: false })
  @RelationId((jobInterview: JobInterview) => jobInterview.user)
  userId: number;

  @ManyToOne(() => User, (user) => user.id)
  student: User;

  @Column({ nullable: false })
  @RelationId((JobInterview: JobInterview) => JobInterview.student)
  studentId: number;

  @ManyToOne(() => Job, (job) => job.id)
  job: Job;

  @Column()
  @RelationId((jobInterview: JobInterview) => jobInterview.job)
  jobId: number;

  @Column({ nullable: false, type: 'timestamp' })
  interviewDate: Date;

  @Column({ nullable: false })
  contactNumber: string;

  @Column({ nullable: false })
  otherDetails: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
