import { Entity, Column, OneToMany } from 'typeorm';
import { AbstractEntity } from '../../../common/entities/abstract.entity';
import { InfrastructureParameter } from './infrastructure-parameter.entity';

@Entity()
export class InfrastructureCategory extends AbstractEntity<InfrastructureCategory> {
  @Column({ nullable: false })
  name: string;

  @Column({ nullable: true })
  brandId: number;

  @OneToMany(
    () => InfrastructureParameter,
    (parameter) => parameter.infrastructureCategory,
  )
  parameters: InfrastructureParameter[];
}

