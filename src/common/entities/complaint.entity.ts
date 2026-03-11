import {
  Column,
  Entity,
  ManyToOne,
  RelationId,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { AbstractEntity } from './abstract.entity';
import { User } from './user.entity';
import { ComplaintCategories } from './complaintCategories.entity';

@Entity()
export class Complaint extends AbstractEntity<Complaint> {
  @ManyToOne(() => User, (user) => user.id)
  user: User;

  @Column({ nullable: false })
  @RelationId((complaint: Complaint) => complaint.user)
  userId: number;

  @Column({ nullable: false })
  userName: string;

  @Column({ nullable: true })
  userMobile: string;

  @Column({ nullable: true })
  userEmail: string;

  @Column({ nullable: false })
  userBrand: string;

  @Column({ nullable: false })
  userZone: string;

  @Column({ nullable: false })
  userRegion: string;

  @Column({ nullable: false })
  userArea: string;

  @Column({ nullable: false })
  userCenter: string;

  @ManyToOne(() => ComplaintCategories, (CC) => CC.id)
  complaintCategory: ComplaintCategories;

  @Column({ nullable: false })
  @RelationId((complaint: Complaint) => complaint.complaintCategory)
  complaintCategoryId: number;

  @Column({ nullable: false })
  complaintType: string;

  @Column({ nullable: true })
  complaintDescription: string;

  @Column('smallint', { default: 0 }) // 0: created 1: resolved
  isResolved: number;

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
