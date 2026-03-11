import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  RelationId,
  Check,
} from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { TaxonomyBrand } from './taxonomyBrand.entity';

@Entity()
@Check(`"isActive" IN (0, 1)`)
export class TaxonomyBrandCategory extends AbstractEntity<TaxonomyBrandCategory> {
  @Column({ nullable: false })
  name: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({
    nullable: true,
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @ManyToOne(() => TaxonomyBrand, (brand) => brand.id)
  taxonomyBrand: TaxonomyBrand;

  @Column()
  @RelationId(
    (taxonomyBrandCategory: TaxonomyBrandCategory) => taxonomyBrandCategory.taxonomyBrand,
  )
  taxonomyBrandId: number;

  @Column({ type: 'smallint', nullable: false, default: 1 })
  isActive: number;
}
