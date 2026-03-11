import {
  Entity,
  Column,
  CreateDateColumn,
  OneToMany,
  JoinColumn,
  Check,
  ManyToOne,
  RelationId,
  UpdateDateColumn,
} from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { TaxonomyMapping } from './taxonomyMapping.entity';
import { LearningCircleType } from './learning-circle-type.entity';
import { AccountTypeEnum } from './taxonomyBrand.entity';
import { IsEnum } from 'class-validator';

export enum PublishingOption {
  PromotedToFrontPage = 'Promoted to FrontPage',
  StickyAtTop = 'Sticky at Top',
}

@Entity()
@Check(`"commentPermission" IN (0, 1)`)
export class LearningCircle extends AbstractEntity<LearningCircle> {
  @Column({ nullable: true })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  link: string;

  @Column({ nullable: true })
  video: string;

  @Column({ nullable: true })
  videoFileName: string;

  @Column({ nullable: true })
  thumbnail: string;

  @Column({ nullable: true })
  thumbnailFileName: string;

  @Column({ nullable: true })
  videoLink : string;

  @Column({ nullable: true })
  contentFile: string;

  @Column({ nullable: true })
  contentFileName: string;

  @ManyToOne(() => LearningCircleType, (learningCircleType) => learningCircleType.id)
  learningCircleType: LearningCircleType;

  @Column()
  @RelationId((learningCircle: LearningCircle) => learningCircle.learningCircleType)
  learningCircleTypeId: number;

  @OneToMany(() => TaxonomyMapping, (taxonomyMapping) => taxonomyMapping.learningCircle)
  taxonomyMapping: TaxonomyMapping[];

  @Column({ type: 'text', array: true, default: () => "'{}'" })
  bookIdTags: string[];

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column('simple-array', { nullable: true })
  publishingOptions: PublishingOption[];

  @Column({ type: 'smallint', nullable: true, default: 0 })
  commentPermission: number;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
