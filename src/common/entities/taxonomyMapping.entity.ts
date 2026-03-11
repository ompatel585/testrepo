import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  RelationId,
} from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { TaxonomyBrand } from './taxonomyBrand.entity';
import { TaxonomyBrandCategory } from './taxonomyBrandCategory.entity';
import { LearningCircle } from './learningCircle.entity';

@Entity()
export class TaxonomyMapping extends AbstractEntity<TaxonomyMapping> {
  @ManyToOne(() => TaxonomyBrand, (brand) => brand.id)
  taxonomyBrand: TaxonomyBrand;

  @Column()
  @RelationId((taxonomyMapping: TaxonomyMapping) => taxonomyMapping.taxonomyBrand)
  taxonomyBrandId: number;

  @ManyToOne(() => TaxonomyBrandCategory, (category) => category.id)
  taxonomyBrandCategory: TaxonomyBrandCategory;

  @Column()
  @RelationId((taxonomyMapping: TaxonomyMapping) => taxonomyMapping.taxonomyBrandCategory)
  taxonomyBrandCategoryId: number;

  @ManyToOne(() => LearningCircle, (learningCircle) => learningCircle.id)
  learningCircle: LearningCircle;

  @Column()
  @RelationId((taxonomyMapping: TaxonomyMapping) => taxonomyMapping.learningCircle)
  learningCircleId: number;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({
    nullable: true,
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
