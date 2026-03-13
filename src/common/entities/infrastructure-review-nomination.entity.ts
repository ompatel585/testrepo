import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Brand } from './brand.entity';
import { Centre } from './centre.entity';
import { InfrastructureReviewTemplate } from './infrastructure-review-template.entity';

export enum ReviewNominationStatus {
  OPEN = 'open',
  PENDING = 'pending',
  APPROVE = 'approve',
  RETURN = 'return',
}

@Entity({ name: 'infrastructureReviewNomination', schema: 'public' })
export class InfrastructureReviewNomination {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  brandId: number;

  @ManyToOne(() => Brand)
  @JoinColumn({ name: 'brandId' })
  brand: Brand;

  @Column()
  centerId: number;

  @ManyToOne(() => Centre)
  @JoinColumn({ name: 'centerId' })
  center: Centre;

  @Column()
  templateId: number;

  @ManyToOne(() => InfrastructureReviewTemplate)
  @JoinColumn({ name: 'templateId' })
  template: InfrastructureReviewTemplate;

  @Column({ length: 255 })
  reason: string;

  @Column({ type: 'timestamp' })
  dueDate: Date;

  @Column({ type: 'text', nullable: true })
  note: string;

  @Column({
    type: 'enum',
    enum: ReviewNominationStatus,
    default: ReviewNominationStatus.OPEN,
  })
  status: ReviewNominationStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}