import { Entity, Column, ManyToOne, RelationId, Unique, Check } from 'typeorm';
import { Brand } from './brand.entity';
import { AbstractEntity } from './abstract.entity';

@Entity()
@Check(`"status" IN (0, 1)`)
@Unique(['brandId', 'name'])
export class WorkCategory extends AbstractEntity<WorkCategory> {
  @Column({ type: 'citext' })
  name: string;

  @ManyToOne(() => Brand, (brand) => brand.workCategory, { onDelete: 'CASCADE' })
  brand: Brand;

  @Column({ nullable: false })
  @RelationId((workCategory: WorkCategory) => workCategory.brand)
  brandId: number;

  @Column('smallint', { default: 1 })
  status: number;
}
