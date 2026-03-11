import { Column, Entity, ManyToOne, RelationId } from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { SkillCategory } from './skillCategory.entity';

@Entity()
export class JobProfile extends AbstractEntity<JobProfile> {
  @Column({ nullable: false })
  name: string;

  @ManyToOne(() => SkillCategory, (skillCategory) => skillCategory.id)
  skillCategory: SkillCategory;

  @Column({ nullable: false })
  @RelationId((jobProfile: JobProfile) => jobProfile.skillCategory)
  skillCategoryId: number;
}
