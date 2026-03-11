import { Check, Column, Entity, ManyToOne, RelationId } from 'typeorm';
import { User } from './user.entity';
import { AbstractEntity } from './abstract.entity';

@Entity()
@Check(`"visibility" IN (0, 1)`)
export class Portfolio extends AbstractEntity<Portfolio> {
  @ManyToOne(() => User, (user) => user.id)
  user: User;

  @Column({ nullable: false })
  @RelationId((portfolio: Portfolio) => portfolio.user)
  userId: number;

  @Column('int', { array: true })
  workIds: number[];

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column('smallint', { default: 0 })
  visibility: number;

  @Column()
  thumbnail: string;

  @Column({ nullable: true })
  reelLink: string;
}
