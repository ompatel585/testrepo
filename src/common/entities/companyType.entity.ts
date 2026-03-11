import { Entity, Column } from 'typeorm';
import { AbstractEntity } from './abstract.entity';

@Entity()
export class CompanyType extends AbstractEntity<CompanyType> {
  @Column({ unique: true })
  name: string;
}
