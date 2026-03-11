import { Entity, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { AbstractEntity } from './abstract.entity';

@Entity()
export class CourseCategory extends AbstractEntity<CourseCategory> {
  @Column({ nullable: false })
  categoryName: string;

  @Column({ nullable: false })
  eventId: string;

  @Column({ nullable: false })
  CourseCode: string;

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
