import { Entity, Column, OneToMany } from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { WorkComment } from './workComment.entity';

@Entity()
export class MasterWorkComment extends AbstractEntity<MasterWorkComment> {
  @Column('text')
  content: string;

  @OneToMany(() => WorkComment, (workComment) => workComment.id)
  workComment: WorkComment;
}
