import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Check,
  PrimaryColumn,
  Index,
} from 'typeorm';
import { AbstractEntity } from './abstract.entity';

const defaultSection = [
  {
    title: 'Book',
    active: true,
    isTrainerSection: false,
    resources: [],
  },
  {
    title: 'Resources',
    active: true,
    isTrainerSection: false,
    resources: [],
  },
  {
    title: 'Trainer Materials',
    active: true,
    isTrainerSection: false,
    resources: [],
  },
];

@Entity()
@Index('idx_course_module_id', ['id'])
@Index('idx_aptrack_1_book_id', ['aptrack_1_book_id'])
@Check(`"frontPagePromote" IN (0, 1)`)
@Check(`"topOnList" IN (0, 1)`)
@Check(`"canComment" IN (0, 1)`)
@Check(`"status" IN (0, 1)`)
@Check(`"isActive" IN (0, 1)`)
export class CourseModule extends AbstractEntity<CourseModule> {
  @Column({ nullable: true, unique: true })
  aptrack_1_book_id: number;

  @Column({ nullable: true, unique: true })
  aptrack_2_book_id: number;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  code: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: false })
  brandKey: number;

  @Column({ nullable: true })
  subBrandKey: number;

  @Column('int', { array: true, default: [] })
  aptrack1SubBrandKeys: number[];

  @Column('int', { array: true, default: [] })
  aptrack2SubBrandKeys: number[];

  @Column({ nullable: true })
  thumbnail: string;

  @Column({ nullable: true })
  feedback: string;

  @Column('smallint', { default: 0 })
  status: number;

  @Column({ type: 'jsonb', nullable: true, default: defaultSection })
  sections: Record<string, any>[];

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({
    nullable: true,
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @Column('smallint', { default: 0 })
  frontPagePromote: number;

  @Column('smallint', { default: 0 })
  topOnList: number;

  @Column('smallint', { default: 0 })
  canComment: number;

  @Column('smallint', { default: 1 })
  isActive: number;
}
