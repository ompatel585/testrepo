import { Entity, Column, OneToMany } from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { Work } from './work.entity';
import { Event } from './event.entity';
import { WorkCategory } from './workCategory.entity';

@Entity()
export class Brand extends AbstractEntity<Brand> {
  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  code: string;

  @Column({ nullable: false })
  key: number;

  @Column({ nullable: true })
  icon: string;

  @OneToMany(() => Work, (work) => work.brand)
  work: Work[];

  @OneToMany(() => Event, (event) => event.brand)
  events: Event[];

  @Column('int', { array: true, default: [] })
  subBrandIds: number[];

  @OneToMany(() => WorkCategory, (workCategory) => workCategory.brand)
  workCategory: WorkCategory[];
}
