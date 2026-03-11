import { Column, CreateDateColumn, Entity, Index, ManyToOne, RelationId } from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { User } from './user.entity';
import { Work } from './work.entity';

@Entity()
@Index('idx_work-view_work_id_user_id', ['workId', 'userId'])
export class WorkView extends AbstractEntity<WorkView> {
  @ManyToOne(() => Work, (work) => work.id)
  work: Work;

  @Column({ nullable: false })
  @RelationId((workView: WorkView) => workView.work)
  workId: number;

  @ManyToOne(() => User, (user) => user.id)
  user: User;

  @Column({ nullable: false })
  @RelationId((workView: WorkView) => workView.user)
  userId: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}
