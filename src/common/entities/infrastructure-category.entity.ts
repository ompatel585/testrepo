import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'infrastructure_category', schema: 'public' })
export class InfrastructureCategory {

  @PrimaryGeneratedColumn()
  id: number;

  // allow null so TypeORM does not try to enforce NOT NULL during sync
  @Column({ type: 'varchar', nullable: true })
  name?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ nullable: true })
  brandId?: number;

  @Column({ default: 1 })
  status: number;
}