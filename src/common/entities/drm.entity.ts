import { Check, Column, CreateDateColumn, Entity, UpdateDateColumn } from 'typeorm';
import { AbstractEntity } from './abstract.entity';

@Entity()
@Check(`"allowCopy" IN (0, 1)`)
@Check(`"allowPrint" IN (0, 1)`)
@Check(`"status" IN (0, 1)`)
export class Drm extends AbstractEntity<Drm> {
  @Column()
  title: string;

  @Column({ length: 225, default: 'Aptech' })
  author: string;

  @Column({ length: 225, default: 'Aptech' })
  publisher: string;

  @Column({ type: 'smallint', default: 0 })
  allowCopy: number;

  @Column({ type: 'smallint', default: 0 })
  allowPrint: number;

  @Column({ nullable: true })
  fileName: string;

  @Column()
  filePath: string;

  @Column({ type: 'smallint', default: 0 })
  status: number;

  @Column({ unique: true, nullable: true })
  resourceId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
