import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  RelationId,
} from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { User } from './user.entity';
import { WorkHistory } from './work-history.entity';
import { Files } from './files.entity';
import { Categories } from './categories.entity';
import { WorkStatus } from '../enum/work-status.enum';
import { WorkLike } from './workLike.entity';
import { WorkView } from './workView.entity';
import { Platform } from '../enum/platform.enum';
import { WorkComment } from './workComment.entity';
import { Exclude } from 'class-transformer';
import { Brand } from './brand.entity';
import { WorkCategory } from './workCategory.entity';

@Entity()
@Check(`"reviewRequired" IN (0, 1)`)
@Check(`"visibility" IN (0, 1)`)
@Index('idx_work_id', ['id'])
@Index('idx_work_created_at', ['createdAt'])
@Index('idx_work_brand_id', ['brandId'])
@Index('idx_work_userid', ['userId'])
@Index('idx_work_reviewerid', ['reviewerId'])
@Index('idx_work_like_count', ['likeCount'])
@Index('idx_work_brand_id_user_id_visibility', ['brandId', 'userId', 'visibility'])
export class Work extends AbstractEntity<Work> {
  @ManyToOne(() => User, (user) => user.id)
  user: User;

  @Column({ nullable: true })
  @RelationId((work: Work) => work.user)
  userId: number;

  @Column('smallint', { default: 0 })
  reviewRequired: number;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn()
  reviewer: User;

  @Column({ nullable: true })
  @RelationId((work: Work) => work.reviewer)
  reviewerId: number;

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

  @Column({ nullable: true })
  @RelationId((work: Work) => work.category)
  categoryId: number;

  @Column('text', { array: true, default: () => 'ARRAY[]::text[]' })
  tags: string[];

  @Column({ nullable: true })
  thumbnail: string;

  @Exclude()
  @Column({ nullable: true })
  compressedThumbnail: string;

  @Column({ type: 'enum', enum: WorkStatus, default: 'draft' })
  status: string;

  @Column({ default: 1 })
  version: number;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @OneToMany(() => WorkHistory, (workHistory) => workHistory.work)
  workHistory: WorkHistory[];

  @OneToMany(() => Files, (file) => file.work)
  files: Files[];

  @OneToMany(() => WorkLike, (workLike) => workLike.work)
  workLike: WorkLike[];

  @OneToMany(() => WorkComment, (workComment) => workComment.work)
  workComment: WorkComment[];

  @OneToMany(() => WorkView, (workView) => workView.work)
  workView: WorkView[];

  @Column({ nullable: true })
  videoLink: string;

  @Column({ nullable: true })
  projectId: string;

  @Column({ nullable: true })
  center: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  subCategoryId: string;

  @Column({ type: 'timestamp', default: null })
  submittedAt: Date;

  @Column({ nullable: true, type: 'enum', enum: Platform })
  createdBy: string;

  @Column({ default: 0 })
  viewCount: number;

  @Column({ default: 0 })
  likeCount: number;

  @Column({ default: 0 })
  commentCount: number;

  @ManyToOne(() => Brand, (brand) => brand.work)
  brand: Brand;

  @Column({ nullable: false })
  @RelationId((work: Work) => work.brand)
  brandId: number;

  @ManyToOne(() => WorkCategory, (categories) => categories.id)
  workCategory: WorkCategory;

  @Column({ nullable: true })
  @RelationId((work: Work) => work.workCategory)
  workCategoryId: number;
}
