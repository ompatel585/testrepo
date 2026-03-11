import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  RelationId,
} from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { User } from './user.entity';
import { Brand } from './brand.entity';

@Entity()
export class EventCourseCategory extends AbstractEntity<EventCourseCategory> {
  @Column({ nullable: false })
  categoryName: string;

  @Column({ nullable: false })
  courseCode: string;

  @Column('text', {
    array: true,
    default: () => 'ARRAY[]::text[]',
  })
  allowedType: string[];

  @ManyToOne(() => Brand, (brand) => brand.id)
  brand: Brand;

  // @Column({ nullable: true, default: null })
  // @RelationId((user: EventCourseCategory) => user.brand)
  // brandId: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
