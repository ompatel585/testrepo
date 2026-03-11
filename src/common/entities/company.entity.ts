import { Column, Entity, ManyToOne, RelationId, Check } from 'typeorm';

import { AbstractEntity } from './abstract.entity';
import { CompanyCategory } from './companyCategory.entity';
import { CompanyType } from './companyType.entity';

@Entity()
export class Company extends AbstractEntity<Company> {
  @Column({ nullable: false })
  companyName: string;

  @Column()
  website: string;

  @ManyToOne(() => CompanyCategory, (companyCategory) => companyCategory.id)
  companyCategory: CompanyCategory;

  @Column({ nullable: true })
  @RelationId((company: Company) => company.companyCategory)
  companyCategoryId: number;

  @ManyToOne(() => CompanyType, (companyType) => companyType.id)
  companyType: CompanyType;

  @Column({ nullable: true })
  @RelationId((company: Company) => company.companyType)
  companyTypeId: number;

  @Column({ nullable: true })
  logoImage: string;
}
