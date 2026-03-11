import { Column, CreateDateColumn, Entity, Index, ManyToOne, RelationId } from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { User } from './user.entity';
import { Work } from './work.entity';

@Entity()
@Index('idx_work-like_work_id_user_id', ['workId', 'userId'])
export class WorkLike extends AbstractEntity<WorkLike> {
  @ManyToOne(() => Work, (work) => work.workLike)
  work: Work;

  @Column({ nullable: false })
  @RelationId((workLike: WorkLike) => workLike.work)
  workId: number;

  @ManyToOne(() => User, (user) => user.id)
  user: User;

  @Column({ nullable: false })
  @RelationId((workLike: WorkLike) => workLike.user)
  userId: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}
