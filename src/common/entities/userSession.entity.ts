import { Role } from '../enum/role.enum';
import { AbstractEntity } from './abstract.entity';
import { User } from './user.entity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';
import { UserRole } from './userRole.entity';

@Entity()
@Index('idx_user_session_user_id', ['userId'])
export class UserSession {
  @PrimaryColumn()
  userId: number;

  @OneToOne(() => User, (user) => user.id)
  @JoinColumn()
  user: User;

  @Column({ nullable: true })
  sessionId: string;

  @Column({
    type: 'enum',
    enum: Role,
    nullable: true,
  })
  selectedRole: Role;

  @Column({ nullable: true })
  brandId: number;

  @Column({ nullable: true })
  brandKey: number;

  @ManyToOne(() => UserRole, (userRole) => userRole.id, { onDelete: 'CASCADE' })
  userRole: UserRole;
}
