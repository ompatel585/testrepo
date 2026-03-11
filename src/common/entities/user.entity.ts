import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';
import {
  Entity,
  Column,
  ManyToOne,
  OneToOne,
  OneToMany,
  CreateDateColumn,
  RelationId,
  Index,
  Check,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Organization } from './origanization.entity';
import { Role } from '../enum/role.enum';
import { AbstractEntity } from './abstract.entity';
import { Profile } from './profile.entity';
import { Work } from './work.entity';
import { Exclude } from 'class-transformer';
import { Notification } from './notification.entity';
import { Fee } from './fee.entity';
import { ApiProperty } from '@nestjs/swagger';

import { WorkLike } from './workLike.entity';
import { WorkView } from './workView.entity';
import { Platform } from '../enum/platform.enum';
import { Brand } from './brand.entity';
import { WorkComment } from './workComment.entity';
import { Follow } from './follow.entity';
import { Payment } from './payment.entity';
import { UserMetaData } from './user-metadata.entity';
import { BrandUniversityCode } from '../enum/brand.enum';
import { UserRole } from './userRole.entity';

export enum User_Type {
  Pro_Connect = 'pro-connect',
  Student = 'student',
  CE = 'CE',
  AE = 'AE',
}

@Entity()
@Check(`"termsAccepted" IN (0, 1)`)
@Index('idx_user_id', ['id'])
@Index('idx_user_brand_id', ['brandId'])
export class User extends AbstractEntity<User> {
  @ApiProperty({ example: 'aptrack01', description: 'unique user id' })
  @Column({ unique: true, nullable: true })
  userId: string;

  @OneToMany(() => Work, (work) => work.id)
  work: Work;

  @ManyToOne(() => Organization, (organization) => organization.id)
  organization: Organization;
  // just a relation between userprofile and user table and not a column.
  //  And the foreign key is userReference and which will become userReferenceId
  // in db columns based on relation
  @OneToOne(() => Profile, (profile) => profile.userReference, { cascade: true })
  profile: Profile;

  @ApiProperty({ example: 'std01' })
  @Column({ nullable: true })
  name: string;

  @ApiProperty({ example: '9999999901' })
  @Column({ nullable: true })
  mobile: string;

  @ApiProperty({ example: 'std01@mail.com' })
  @Column({
    nullable: true,
    transformer: {
      // while writing
      to(value) {
        if (value) {
          return value.toLowerCase();
        }
        return value;
      },
      // while reading
      from(value) {
        return value;
      },
    },
  })
  email: string;

  @Exclude()
  @Column({ nullable: true })
  password: string;

  // comment from
  @ApiProperty({ example: Role.Student })
  @Column({
    type: 'enum',
    enum: Role,
    default: Role.Student,
  })
  role: Role;

  @Column({
    type: 'enum',
    enum: Role,
    array: true,
    default: [Role.Student],
  })
  roles: Role[];

  @Column({ nullable: true })
  zone: string;

  @Column({ nullable: true })
  region: string;

  @Column({ nullable: true })
  area: string;

  @Column({ nullable: true })
  centreName: string;

  @ManyToOne(() => Brand, (brand) => brand.id)
  brand: Brand;

  @Column({ nullable: true })
  @RelationId((user: User) => user.brand)
  brandId: number;

  @Column('int', { array: true, default: [] })
  subBrandIds: number[];

  @IsNumber()
  @Type(() => Number)
  @Column({ nullable: true })
  centreId: number;

  @Column('int', { array: true, default: [] })
  centreIds: number[];
  // comment to

  @OneToMany(() => Notification, (notification) => notification.id)
  notification: Notification;

  @OneToMany(() => Fee, (fee) => fee.id)
  fee: Fee;

  @OneToMany(() => WorkLike, (workLike) => workLike.id)
  workLike: WorkLike;

  @OneToMany(() => WorkComment, (workComment) => workComment.id)
  workComment: WorkComment;

  @OneToMany(() => WorkView, (workView) => workView.id)
  workView: WorkView;

  @Column({ nullable: true })
  adminLevel: string;

  @Column({ nullable: true })
  fcmWebToken: string;

  @Column({ nullable: true })
  fcmAndroidToken: string;

  @Column({ nullable: true })
  fcmIosToken: string;

  @Column('bool', { default: true })
  isDomestic: boolean;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ nullable: true, type: 'enum', enum: Platform })
  createdBy: string;

  @OneToMany(() => Follow, (follow) => follow.follower)
  following: Follow[];

  @OneToMany(() => Follow, (follow) => follow.following)
  followers: Follow[];

  @OneToMany(() => Payment, (payment) => payment.user)
  payment: Payment[];

  @Column({ type: 'smallint', nullable: false, default: 0 })
  termsAccepted: number;

  @OneToOne(() => UserMetaData, (meta) => meta.user)
  userMetaData: UserMetaData;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column('bool', { default: true })
  fetchMetadata: boolean;

  @Column({
    type: 'enum',
    enum: BrandUniversityCode,
    nullable: true,
    default: null,
  })
  universityCode: BrandUniversityCode | null;

  @OneToMany(() => UserRole, (userRole) => userRole.user)
  userRole?: UserRole[];

  @Column({
    type: 'enum',
    enum: User_Type,
    default: User_Type.Pro_Connect,
    nullable: true,
  })
  userType: User_Type;
}
