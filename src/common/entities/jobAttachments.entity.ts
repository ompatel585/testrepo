import {
  Entity,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
  RelationId,
} from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { Job } from './job.entity';

@Entity()
export class JobAttachments extends AbstractEntity<File> {
  @ManyToOne((type) => Job)
  @JoinColumn([{ name: 'jobId', referencedColumnName: 'id' }])
  job: Job;

  @Column({ nullable: true })
  @RelationId((jobAttachments: JobAttachments) => jobAttachments.job)
  jobId: number;

  @Column({ nullable: false })
  fileName: string;

  @Column({ nullable: false })
  filePath: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
