import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn
} from 'typeorm';

import { Brand } from './brand.entity';

export enum TemplateStatus {
  PUBLISH = 'publish',
  DRAFT = 'draft',
  DELETE = 'delete',
}

@Entity('infrastructureReviewTemplate')
export class InfrastructureReviewTemplate {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  name: string;

  @Column()
  brandId: number;

  @ManyToOne(() => Brand)
  @JoinColumn({ name: 'brandId' })
  brand: Brand;

  @Column({ type: 'jsonb' })
  parameters: any;

  @Column({
    type: 'enum',
    enum: TemplateStatus,
    default: TemplateStatus.DRAFT
  })
  status: TemplateStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}