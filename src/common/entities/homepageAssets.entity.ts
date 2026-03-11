import {
  Entity,
  Column,
  CreateDateColumn,
  ManyToOne,
  RelationId,
  JoinColumn,
} from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { Brand } from './brand.entity';

export enum AssetTypeEnum {
  IMAGE = 'image',
  VIDEO = 'video',
}

export enum AssetPositionEnum {
  BANNER = 'banner',
  ADS = 'ads',
}

@Entity()
export class HomePageAssets extends AbstractEntity<HomePageAssets> {
  @Column({
    type: 'enum',
    enum: AssetTypeEnum,
    nullable: false,
  })
  type: AssetTypeEnum;

  @Column({ type: 'varchar', length: 255, nullable: false })
  url: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  redirectUrl: string;

  @Column({
    type: 'enum',
    enum: AssetPositionEnum,
    nullable: false,
  })
  position: AssetPositionEnum;

  @ManyToOne(() => Brand, (brand) => brand.id)
  @JoinColumn({ name: 'brandId' })
  brand: Brand;

  @Column({ nullable: false })
  @RelationId((homepageAssets: HomePageAssets) => homepageAssets.brand)
  brandId: number;

  @Column({ default: 1 })
  status: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}
