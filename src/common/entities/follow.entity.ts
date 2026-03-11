import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, RelationId } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Follow {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.following, { onDelete: 'CASCADE' })
  follower: User;

  @Column({ nullable: false })
  @RelationId((follow: Follow) => follow.follower)
  followerId: number;

  @ManyToOne(() => User, (user) => user.followers, { onDelete: 'CASCADE' })
  following: User;

  @Column({ nullable: false })
  @RelationId((follow: Follow) => follow.following)
  followingId: number;
}
