import { Entity, Column, CreateDateColumn, UpdateDateColumn, Check } from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { Exclude } from 'class-transformer';

@Entity({ name: 'eproject' })
@Check(`"isPk" IN (0,1)`)
@Check(`"isViewed" IN (0,1)`)
@Check(`"isCancelled" IN (0,1)`)
export class EProject extends AbstractEntity<EProject> {
  @Column({ type: 'varchar', length: 255 })
  studentKey: string;

  @Column({ type: 'varchar', length: 255 })
  eprojectExamCode: string;

  @Column({ type: 'text' })
  centerDetails: string;

  @Column({ type: 'text' })
  courseDetails: string;

  @Column({ type: 'varchar', length: 64 })
  term: string;

  @Column({ type: 'date' })
  eprojectStartDate: Date;

  @Column({ type: 'date' })
  submissionDate: Date;

  @Column({ type: 'date' })
  dueDate: Date;

  @Exclude()
  @Column({ type: 'varchar', length: 255, nullable: true })
  token: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  userName: string;

  @Exclude()
  @Column({ type: 'varchar', length: 255, nullable: true })
  password: string;

  @Column('smallint', { default: 0 })
  isPk: number;

  @Column('smallint', { default: 0 })
  isViewed: number;

  @Column('smallint', { default: 0 })
  isCancelled: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
