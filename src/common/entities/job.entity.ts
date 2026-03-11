import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  RelationId,
} from 'typeorm';

import { User } from './user.entity';
import { PackageType } from '../enum/package-type.enum';
import { AbstractEntity } from './abstract.entity';
import { JobAttachments } from './jobAttachments.entity';
import { JobTitle } from './jobTitle.entity';
import { Brand } from './brand.entity';
import { Company } from './company.entity';
import { City } from './city.entity';
import { JobType } from './jobType.entity';
import { SkillCategory } from './skillCategory.entity';
import { JobCentreMapping } from './jobCentreMapping.entity';

export enum JobStatus {
  Open = 'Open',
  Closed = 'Closed',
}

@Entity()
@Check(`"isBond" IN (0, 1)`)
export class Job extends AbstractEntity<Job> {
  @OneToMany(() => JobCentreMapping, (jobCentreMapping) => jobCentreMapping.job)
  jobCentreMappings: JobCentreMapping[];

  @ManyToOne(() => User, (user) => user.id)
  user: User;

  @Column({ nullable: false })
  @RelationId((job: Job) => job.user)
  userId: number;

  @ManyToOne(() => Brand, (brand) => brand.id)
  brand: Brand;

  @Column({ nullable: false, default: 0 })
  @RelationId((job: Job) => job.brand)
  brandId: number;

  @Column({ nullable: true })
  zone: string;

  @Column({ nullable: true })
  area: string;

  @Column({ nullable: true })
  region: string;

  @ManyToOne(() => Company, (company) => company.id)
  company: Company;

  @Column({ nullable: false })
  @RelationId((job: Job) => job.company)
  companyId: number;

  @ManyToOne(() => JobTitle, (jobTitle) => jobTitle.id)
  jobTitle: JobTitle;

  @Column({ nullable: false, default: 0 })
  @RelationId((job: Job) => job.jobTitle)
  jobTitleId: number;

  @Column({ nullable: true })
  noOfVacancy: number;

  @ManyToOne(() => City, (city) => city.id)
  city: City;

  @Column({ nullable: false, default: 0 })
  @RelationId((job: Job) => job.city)
  cityId: number;

  @ManyToOne(() => JobType, (jobType) => jobType.id)
  jobType: JobType;

  @Column({ nullable: true })
  @RelationId((job: Job) => job.jobType)
  jobTypeId: number;

  @ManyToOne(() => SkillCategory, (skillCategory) => skillCategory.id)
  skillCategory: SkillCategory;

  @Column({ nullable: true })
  @RelationId((job: Job) => job.skillCategory)
  skillCategoryId: number;

  @Column({ type: 'enum', enum: PackageType, default: 'fix' })
  packageType: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  package: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  packageFrom: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  packageTo: number;

  @Column({ nullable: true })
  jobDescription: string;

  @Column('date')
  applicationLastDate: Date;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'enum', enum: JobStatus, default: 'Open' })
  status: string;

  @OneToMany(() => JobAttachments, (jobAttachment) => jobAttachment.job)
  jobAttachments: JobAttachments[];

  @Column('smallint', { default: 0 })
  isBond: number;
}
