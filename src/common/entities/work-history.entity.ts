import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { User } from './user.entity';
import { Work } from './work.entity';
import { Categories } from './categories.entity';
import { Files } from './files.entity';

@Entity()
export class WorkHistory extends AbstractEntity<WorkHistory> {
  @ManyToOne(() => Work, (work) => work.workHistory)
  work: Work;

  @Column({ nullable: true })
  feedback: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column('smallint', { default: 0 })
  visibility: number;

  @ManyToOne(() => Categories, (categories) => categories.id)
  category: Categories;

  @Column('text', { array: true, default: () => 'ARRAY[]::text[]' })
  tags: string[];

  @Column({ nullable: true })
  thumbnail: string;

  @Column({ default: 'draft' })
  status: string;

  @Column({ default: 1 })
  version: number;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @OneToMany(() => Files, (file) => file.workHistory)
  files: Files[];

  @Column({ nullable: true })
  projectId: string;

  // can we remove category , visibility and tags since they are not to going change
}
