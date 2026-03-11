import { Entity, Column, OneToOne } from 'typeorm';
import { AbstractEntity } from './abstract.entity';

@Entity()
export class JobTitle extends AbstractEntity<JobTitle> {
  @Column({ unique: true, nullable: false })
  name: string;
}
