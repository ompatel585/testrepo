import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from './user.entity'; // Assuming you have a User entity
import { AbstractEntity } from './abstract.entity';

@Entity('userActivity')
export class UserActivity extends AbstractEntity<UserActivity> {
  @ManyToOne(() => User, { nullable: false })
  user: User;

  @Column()
  userId: number;

  @Column({ nullable: true })
  ip: string;

  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  userAgent: string;

  @Column({ nullable: true })
  deviceType: string; // 'computer', 'mobile', 'tablet', etc.

  @Column({ nullable: true })
  deviceOs: string; // 'Windows', 'macOS', 'iOS', 'Android', etc.

  @Column({ nullable: true })
  browserName: string; // 'Chrome', 'Safari', 'Firefox', etc.

  @Column({ nullable: true })
  browserVersion: string;

  @Column({ nullable: true })
  appType: string; // 'webBrowser', 'mobileBrowser', 'androidApp', 'iosApp'

  @Column({ nullable: true })
  activityType: string; // 'loggedIn', 'loggedOut', 'pageView', etc.

  @CreateDateColumn({ type: 'timestamp' })
  timestamp: Date;
}
