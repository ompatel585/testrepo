import { Entity, Column, OneToOne } from 'typeorm';
import { AbstractEntity } from './abstract.entity';

@Entity()
export class SkillCategory extends AbstractEntity<SkillCategory> {
  @Column({ unique: true, nullable: false })
  name: string;
}
