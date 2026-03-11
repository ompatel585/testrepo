import { Entity, Column, OneToOne } from 'typeorm';
import { AbstractEntity } from './abstract.entity';

@Entity()
export class Categories extends AbstractEntity<Categories> {
  @Column({ unique: true, nullable: false })
  name: string;
}
