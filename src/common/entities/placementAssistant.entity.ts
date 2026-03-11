import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  OneToOne,
  RelationId,
} from 'typeorm';

import { AbstractEntity } from './abstract.entity';
import { User } from './user.entity';
import { City } from './city.entity';
import { JobTitle } from './jobTitle.entity';

@Entity()
@Check(`"isFreelancing" IN (0, 1)`)
@Check(`"isConfirmPlacement" IN (0, 1)`)
export class PlacementAssistant extends AbstractEntity<PlacementAssistant> {
  @ManyToOne(() => User, (user) => user.id)
  user: User;

  @Column({ nullable: false })
  @RelationId((placementAssistant: PlacementAssistant) => placementAssistant.user)
  userId: number;

  @Column({ nullable: false })
  educationQualification: string;

  @Column({ nullable: true })
  otherQualification: string;

  @Column('smallint', { default: 0 })
  isFreelancing: number;

  @ManyToOne(() => JobTitle, (jobTitle) => jobTitle.id)
  jobTitle: JobTitle;

  @Column({ nullable: true })
  @RelationId((placementAssistant: PlacementAssistant) => placementAssistant.jobTitle)
  jobTitleId: number;

  @ManyToOne(() => City, (city) => city.id)
  city: City;

  @Column({ nullable: false })
  @RelationId((placementAssistant: PlacementAssistant) => placementAssistant.city)
  cityId: number;

  @Column({ nullable: false })
  previousJobExperience: string;

  @Column('smallint', { default: 0 })
  isConfirmPlacement: number;

  @Column({ nullable: false })
  portfolioLink: string;

  @Column({ nullable: false })
  attachmentFile: string;
}
