import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity'; // adjust path as needed
import { IsString } from 'class-validator';

@Entity('user_blacklist')
export class UserBlacklist {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsString()
  userId: string; // foreign key reference to User

  @Column()
  @IsString()
  addedBy: string; // userId who added to blacklist

  @CreateDateColumn()
  createdAt: Date;
}
