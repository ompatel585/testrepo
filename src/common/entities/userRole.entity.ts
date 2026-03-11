import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  RelationId,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Role } from '../enum/role.enum';
import { Brand } from './brand.entity';
import { IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

@Unique(['userId', 'brandId', 'role'])
@Entity()
export class UserRole {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.userRole, { onDelete: 'CASCADE' })
  user: User;

  @Column({ nullable: true })
  @RelationId((userRole: UserRole) => userRole.user)
  userId: number;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.Student,
  })
  role: Role;

  @ManyToOne(() => Brand, (brand) => brand.id)
  brand: Brand;

  @Column({ nullable: true })
  @RelationId((userRole: UserRole) => userRole.brand)
  brandId: number;

  @Column({ nullable: true })
  zone: string;

  @Column({ nullable: true })
  region: string;

  @Column({ nullable: true })
  area: string;

  @Column({ nullable: true })
  centreName: string;

  @Column('int', { array: true, default: [] })
  subBrandIds: number[];

  @IsNumber()
  @Type(() => Number)
  @Column({ nullable: true })
  centreId: number;

  @Column('int', { array: true, default: [] })
  centreIds: number[];

  @Column({ type: 'jsonb', default: [] })
  hierarchy: Record<string, any>[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
