import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  RelationId,
} from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { Brand } from './brand.entity';

export enum EventStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}
export enum WildCardStatus {
  DISABLED = 0,
  ENABLED = 1,
}
export type EventAssets = {
  bannerPath: string;
  ruleBookPath: string;
  evaluationCriteriaPath: string;
};
@Entity()
export class Event {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int', { array: true, nullable: true })
  country: number[];

  @ManyToOne(() => Brand, (brand) => brand.events, { nullable: true, eager: true })
  @JoinColumn({ name: 'brandId' })
  brand: Brand;

  @RelationId((event: Event) => event.brand)
  brandId: number;

  @Column()
  eventName: string;

  @Column({ type: 'date' })
  startDate: string;

  @Column({ type: 'date' })
  endDate: string;

  @Column('jsonb', { nullable: true })
  categories: {
    domestic: number[];
    international: number[];
  };

  @Column('text')
  description: string;

  @Column('text', { array: true, nullable: true })
  guidelines: string[];

  @Column('jsonb', { nullable: true })
  assets: EventAssets;

  @Column({
    type: 'enum',
    enum: EventStatus,
    default: EventStatus.ACTIVE,
  })
  eventStatus: EventStatus;

  @Column({
    type: 'enum',
    enum: WildCardStatus,
    default: WildCardStatus.DISABLED,
  })
  wildCard: WildCardStatus;

  @Column('jsonb', { nullable: true })
  categoryConfig: {
    [categoryId: string]: {
      winner: number;
      runnerUp: number;
    };
  };
}
