import { Entity, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { TaxonomyBrandCategory } from './taxonomyBrandCategory.entity';

export enum AccountTypeEnum {
  Domestic = 'D',
  International = 'I',
}

@Entity()
export class TaxonomyBrand extends AbstractEntity<TaxonomyBrand> {
  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  brandId: number;

  @Column({ nullable: false, type: 'enum', enum: AccountTypeEnum })
  accountType: AccountTypeEnum;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({
    nullable: true,
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @OneToMany(() => TaxonomyBrandCategory, (category) => category.taxonomyBrand)
  taxonomyBrandCategories: TaxonomyBrandCategory[];
}
