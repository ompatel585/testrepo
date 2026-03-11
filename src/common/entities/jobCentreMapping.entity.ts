import { Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Job } from './job.entity';
import { Centre } from './centre.entity';

@Entity()
export class JobCentreMapping {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Job, (job) => job.jobCentreMappings)
  job: Job;

  @ManyToOne(() => Centre, (centre) => centre.jobCentreMappings)
  centre: Centre;
}
