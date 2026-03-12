import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { InfrastructureParameter } from './infrastructure-parameter.entity';

@Entity({ name: 'infrastructureSubParameter', schema: 'public' })
export class InfrastructureSubParameter {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  infrastructureParameterId: number;

  @ManyToOne(
    () => InfrastructureParameter,
    (parameter) => parameter.subParameters,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'infrastructureParameterId' })
  infrastructureParameter: InfrastructureParameter;

  @Column()
  subParameterName: string;

  @Column()
  subParameterType: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}