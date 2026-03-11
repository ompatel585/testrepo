import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Check } from 'typeorm';
import { AbstractEntity } from './abstract.entity';

@Entity()
@Check(`"isActive" IN (0, 1)`)
export class LearningCircleType extends AbstractEntity<LearningCircleType> {
  @Column({ nullable: true })
  name: string;

  @Column({ type: 'smallint', nullable: false, default: 1 })
  isActive: number;
}
