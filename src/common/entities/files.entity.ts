import {
  Entity,
  Column,
  OneToMany,
  OneToOne,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
  RelationId,
  Index,
} from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { Work } from './work.entity';
import { WorkHistory } from './work-history.entity';
import { User } from './user.entity';
import { Exclude } from 'class-transformer';
// import { User } from './user.entity';

enum FileStatus {
  Uploaded = 'uploaded',
  NotUploaded = 'not_uploaded',
}

export enum FileType {
  Image = 'image',
  Video = 'video',
}

@Entity()
export class Files extends AbstractEntity<Files> {
  @ManyToOne(() => WorkHistory, (workHistory) => workHistory.id)
  workHistory: WorkHistory;

  @Column({ nullable: false })
  @RelationId((file: Files) => file.workHistory)
  workHistoryId: number;

  @ManyToOne((type) => Work)
  @JoinColumn([{ name: 'workId', referencedColumnName: 'id' }])
  work: Work;

  @Column({ nullable: false })
  @RelationId((file: Files) => file.work)
  @Index('idx_files_workid')
  workId: number;

  @ManyToOne(() => User, (user) => user.id)
  user: User;

  @Column({ nullable: true })
  @RelationId((file: Files) => file.user)
  userId: number;

  @Column({ nullable: false })
  fileName: string;

  @Column({ nullable: false })
  filePath: string;

  @Exclude()
  @Column({ nullable: true })
  compressedFilePath: string;

  @Column({ type: 'enum', enum: FileType, default: FileType.Image })
  fileType: FileType;

  @Column({ type: 'enum', enum: FileStatus, default: FileStatus.NotUploaded })
  status: FileStatus;

  @Column({ nullable: false })
  version: number;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  projectId: string;
}
