import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm';

import { Brand } from './brand.entity';
import { InfrastructureSubParameter } from './infrastructure-sub-parameter.entity';
import { InfrastructureCategory } from './infrastructure-category.entity';

@Entity({ name: 'infrastructureParameter', schema: 'public' })
@Unique('uq_infra_parameter_name_per_category', [
  'brandId',
  'infrastructureCategoryId',
  'infrastructureParameterName',
])
export class InfrastructureParameter {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  brandId: number;

  @ManyToOne(() => Brand, { nullable: true })
  @JoinColumn({ name: 'brandId' })
  brand: Brand;

  @Column()
  infrastructureCategoryId: number;

  @ManyToOne(() => InfrastructureCategory)
  @JoinColumn({ name: 'infrastructureCategoryId' })
  category: InfrastructureCategory;

  @Column()
  infrastructureParameterName: string;

  @OneToMany(
    () => InfrastructureSubParameter,
    (sub) => sub.infrastructureParameter,
    { cascade: true },
  )
  subParameters: InfrastructureSubParameter[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}