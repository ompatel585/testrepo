import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { AbstractEntity } from '../../../common/entities/abstract.entity';
import { InfrastructureCategory } from './infrastructure-category.entity';

@Entity()
export class InfrastructureParameter extends AbstractEntity<InfrastructureParameter> {
  @Column({ nullable: true })
  brandId: number;

  @Column({ nullable: true })
  infrastructureCategoryId: number;

  @Column({ nullable: true })
  infrastructureParameterName: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  type: string;

  @ManyToOne(
    () => InfrastructureCategory,
    (category) => category.parameters,
  )
  @JoinColumn({ name: 'infrastructureCategoryId' })
  infrastructureCategory: InfrastructureCategory;
}

