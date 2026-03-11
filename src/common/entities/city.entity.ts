import { Entity, Column, OneToOne } from 'typeorm';
import { AbstractEntity } from './abstract.entity';

@Entity()
export class City extends AbstractEntity<City> {
  @Column({ unique: true, nullable: false })
  name: string;
}
