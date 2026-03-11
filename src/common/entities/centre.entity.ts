import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  RelationId,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { Brand } from './brand.entity';
import { JobCentreMapping } from './jobCentreMapping.entity';

@Entity()
export class Centre extends AbstractEntity<Centre> {
  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  centreKey: string;

  @ManyToOne(() => Brand, (brand) => brand.id)
  brand: Brand;

  @Column({ nullable: true })
  @RelationId((centre: Centre) => centre.brand)
  brandId: number;

  @Column({ nullable: true })
  zone: string;

  @Column({ nullable: true })
  region: string;

  @Column({ nullable: true })
  area: string;

  @Column('bool', { default: true })
  isDomestic: boolean;

  @Column({ nullable: true })
  country: string;

  @Column('bool', { default: true })
  active: boolean;

  @Column('bool', { default: true })
  status: boolean;

  @OneToMany(() => JobCentreMapping, (jobCentreMapping) => jobCentreMapping.job)
  jobCentreMappings: JobCentreMapping[];

  @CreateDateColumn({
    nullable: true,
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @UpdateDateColumn({
    nullable: true,
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
