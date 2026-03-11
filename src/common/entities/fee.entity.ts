import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { User } from './user.entity';

export enum FeeStatus {
  PAID = 'paid',
  PENDING = 'pending',
}

@Entity()
export class Fee extends AbstractEntity<Fee> {
  @Column({ length: 255, unique: true })
  bookingCode: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column('date')
  date: Date;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column('decimal', { precision: 10, scale: 2 })
  paid: number;

  @Column('decimal', { precision: 10, scale: 2 })
  due: number;

  @Column({ type: 'enum', enum: FeeStatus })
  status: FeeStatus;

  @Column({ nullable: false })
  url: string;
}
