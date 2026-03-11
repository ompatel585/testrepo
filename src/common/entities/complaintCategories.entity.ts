import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
  ManyToOne,
  RelationId,
} from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { User } from './user.entity';
import { Attachments } from './attachments.entity';

@Entity()
@Unique(['category', 'type'])
export class ComplaintCategories extends AbstractEntity<ComplaintCategories> {
  @Column({ nullable: false })
  category: string;

  @Column({ nullable: false })
  type: string;

  @ManyToOne(() => User, (user) => user.id)
  user: User;

  @Column({ nullable: false })
  @RelationId((attachments: Attachments) => attachments.user)
  userId: number;

  @CreateDateColumn({
    nullable: true,
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @UpdateDateColumn({
    nullable: true,
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
