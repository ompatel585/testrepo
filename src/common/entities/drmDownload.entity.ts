import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
  CreateDateColumn,
  RelationId,
  UpdateDateColumn,
  Check,
} from 'typeorm';
import { Drm } from './drm.entity';
import { AbstractEntity } from './abstract.entity';
import { User } from './user.entity';
import { CourseModule } from './courseModule.entity';

@Entity({ name: 'drm_download' })
@Check(`"status" IN (0, 1)`)
export class DrmDownload extends AbstractEntity<Drm> {
  @Column({ nullable: false })
  resourceId: string;

  @ManyToOne(() => User)
  @JoinColumn()
  user: User;

  @Column({ nullable: false })
  @RelationId((self: DrmDownload) => self.user)
  userId: number;

  @ManyToOne(() => CourseModule)
  @JoinColumn()
  courseModule: CourseModule;

  @Column({ nullable: false })
  @RelationId((self: DrmDownload) => self.courseModule)
  courseModuleId: number;

  @Column({ nullable: false })
  transaction: number;

  @Column({ default: 1 })
  downloadCount: number;

  @Column({ nullable: false })
  oneDownload: number;

  @Column({ nullable: true })
  twoDownload: number;

  @Column({ nullable: true })
  threeDownload: number;

  @Column({ nullable: true })
  fourDownload: number;

  @Column({ nullable: true })
  fiveDownload: number;

  @Column({ nullable: true })
  sixDownload: number;

  @Column('smallint', { default: 1 })
  status: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
