import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  RelationId,
} from 'typeorm';

import { User } from './user.entity';
import { AbstractEntity } from './abstract.entity';
import { Job } from './job.entity';
import { JobApplicationStatus } from '../enum/job-application-status.enum';
import { Attachments } from './attachments.entity';

@Entity()
export class JobApplication extends AbstractEntity<JobApplication> {
  @ManyToOne(() => User, (user) => user.id)
  user: User;

  @Column()
  @RelationId((jobApplication: JobApplication) => jobApplication.user)
  userId: number;

  @ManyToOne(() => Job, (job) => job.id)
  job: Job;

  @Column()
  @RelationId((jobApplication: JobApplication) => jobApplication.job)
  jobId: number;

  @Column()
  coverLetter: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'enum', enum: JobApplicationStatus, default: 'applied' })
  applicationStatus: string;

  @OneToMany(() => Attachments, (attachment) => attachment.jobApplication)
  attachments: Attachments[];
}
