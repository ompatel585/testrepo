import { Column, Entity, OneToMany } from 'typeorm';
import { AbstractEntity } from './abstract.entity';

@Entity()
export class JobType extends AbstractEntity<JobType> {
  @Column()
  name: string;
}
