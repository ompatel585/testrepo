import {
  Entity,
  Column,
  OneToMany,
  OneToOne,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
  RelationId,
} from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { Job } from './job.entity';
import { User } from './user.entity';
import { JobApplication } from './jobApplication.entity';
import { Testimonial } from './testimonial.entity';

export enum ReferenceType {
  Job = 'job',
  Testimonial = 'testimonial',
  JobApplication = 'job-application',
}

@Entity()
export class Attachments extends AbstractEntity<File> {
  @ManyToOne((type) => Job)
  @JoinColumn([{ name: 'jobId', referencedColumnName: 'id' }])
  job: Job;

  @ManyToOne((type) => JobApplication)
  @JoinColumn([{ name: 'jobApplicationId', referencedColumnName: 'id' }])
  jobApplication: JobApplication;

  @ManyToOne((type) => Testimonial)
  @JoinColumn([{ name: 'testimonialId', referencedColumnName: 'id' }])
  testimonial: Testimonial;

  @Column({ nullable: true })
  @RelationId((attachments: Attachments) => attachments.job)
  jobId: number;

  @Column({ nullable: true })
  @RelationId((attachments: Attachments) => attachments.jobApplication)
  jobApplicationId: number;

  @Column({ nullable: true })
  @RelationId((attachments: Attachments) => attachments.testimonial)
  testimonialId: number;

  @ManyToOne(() => User, (user) => user.id)
  user: User;

  @Column({ nullable: false })
  @RelationId((attachments: Attachments) => attachments.user)
  userId: number;

  @Column({ nullable: false })
  fileName: string;

  @Column({ nullable: false })
  filePath: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'enum', enum: ReferenceType, default: 'job', nullable: false })
  referenceType: string;
}
