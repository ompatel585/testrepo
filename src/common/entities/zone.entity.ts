import { Entity, Column } from 'typeorm';
import { AbstractEntity } from './abstract.entity';

@Entity()
export class Zone extends AbstractEntity<Zone> {
  @Column({ unique: true, nullable: false })
  name: string;
}
