import {
  Entity,
  ManyToOne,
  Column,
  CreateDateColumn,
  RelationId,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { User } from './user.entity';
import { Work } from './work.entity';
import { MasterWorkComment } from './masterWorkComment.entity';

@Entity()
@Index('idx_work-comment_work_id', ['workId'])
export class WorkComment extends AbstractEntity<WorkComment> {
  @ManyToOne(() => Work, (work) => work.workComment)
  work: Work;

  @Column({ nullable: false })
  @RelationId((WorkComment: WorkComment) => WorkComment.work)
  workId: number;

  @ManyToOne(() => User, (user) => user.id)
  user: User;

  @Column({ nullable: false })
  @RelationId((WorkComment: WorkComment) => WorkComment.user)
  userId: number;

  @ManyToOne(() => MasterWorkComment, (masterComment) => masterComment.id)
  masterComment: MasterWorkComment;

  @Column({ nullable: false })
  @RelationId((WorkComment: WorkComment) => WorkComment.masterComment)
  masterCommentId: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
