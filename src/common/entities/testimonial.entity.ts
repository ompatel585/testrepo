import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  RelationId,
} from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { User } from './user.entity';
import { Brand } from './brand.entity';

@Entity()
@Check(`"fileFormat" IN ('image', 'video')`)
export class Testimonial extends AbstractEntity<Testimonial> {
  @ManyToOne(() => User, (user) => user.id)
  user: User;

  @Column({ nullable: true })
  @RelationId((testimonial: Testimonial) => testimonial.user)
  userId: number;

  @Column({ nullable: true })
  fileName: string;

  @Column({ nullable: true })
  filePath: string;

  @Column({ nullable: false })
  fileFormat: string;

  @Column({ nullable: true })
  description: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @ManyToOne(() => Brand, (brandMaster) => brandMaster.id)
  @JoinColumn({ name: 'brandId' })
  brand: Brand;

  @Column({ nullable: false })
  @RelationId((testimonial: Testimonial) => testimonial.brand)
  brandId: number;
}
