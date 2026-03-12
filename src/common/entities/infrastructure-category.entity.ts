import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Brand } from './brand.entity';

// @Entity('InfrastructureCategory')
@Entity({ name: 'infrastructureCategory', schema: 'public' })
export class InfrastructureCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text' })
  description: string;

  // ✅ FK column
  @Column({ type: 'int', nullable: true })
  brandId: number;

  // ✅ relation
  @ManyToOne(() => Brand, (brand) => brand.id, { nullable: true })
  @JoinColumn({ name: 'brandId' })
  brand: Brand;

  // ✅ status
  @Column({ type: 'int', default: 1 })
  status: number;

  // ✅ timestamps
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}