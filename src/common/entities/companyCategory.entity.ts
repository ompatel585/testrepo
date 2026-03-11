import { Entity, Column } from 'typeorm';
import { AbstractEntity } from './abstract.entity';

@Entity()
export class CompanyCategory extends AbstractEntity<CompanyCategory> {
  @Column({ unique: true })
  name: string;
}
