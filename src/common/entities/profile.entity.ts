import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  Check,
  OneToOne,
  JoinColumn,
  OneToMany,
  RelationId,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Organization } from './origanization.entity';
import { Role } from '../enum/role.enum';
import { AbstractEntity } from './abstract.entity';
import { User } from './user.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Zone } from './zone.entity';
import { Platform } from '../enum/platform.enum';
@Entity()
@Check(`"isSMSVerified" IN (0, 1)`)
@Check(`"isEmailVerified" IN (0, 1)`)
@Check(`"resetPasswordRequired" IN (0, 1)`)
@Index('idx_userReference_id', ['userReference'])
export class Profile extends AbstractEntity<Profile> {
  /**
   * @Joincolumn() is used so the foreignkey will appear in in userprofile table
   * This userReference will refer to id of the user table.
   * It will appear as userReferenceId in the userProfile table.
   */
  @OneToOne(() => User, (user) => user.id, { onDelete: 'CASCADE' })
  @JoinColumn()
  userReference: User;

  @ApiProperty({ example: 'ravi' })
  @Column({ nullable: false })
  firstName: string;

  @ApiProperty({ example: 'viraj' })
  @Column({ nullable: true })
  middleName: string;

  @ApiProperty({ example: 'singh' })
  @Column({ nullable: true })
  lastName: string;

  @ApiProperty({ example: '1998-09-28' })
  @Column({ nullable: true, type: 'date' })
  dob: Date;

  @ApiProperty({ example: 'student1@mail.com' })
  @Column({
    nullable: true,
    transformer: {
      to(value) {
        if (value) {
          return `${value.toLowerCase()}`;
        }
        return value;
      },
      from(value) {
        return value;
      },
    },
  })
  email: string;

  @ApiProperty({ example: 0 })
  @Column('smallint', { default: 0 })
  isEmailVerified: number;

  @Column({ nullable: true })
  mobile: string;

  @ApiProperty({ example: 1 })
  @Column('smallint', { default: 0 })
  isSMSVerified: number;

  @ApiProperty({ example: 'room no 7, raja nagar, virar' })
  @Column({ nullable: true })
  address: string;

  @ApiProperty({ example: 'india' })
  @Column({ nullable: true })
  country: string;

  @ApiProperty({ example: 'maharashatra' })
  @Column({ nullable: true })
  state: string;

  @ApiProperty({ example: 'mumbai' })
  @Column({ nullable: true })
  city: string;

  @ApiProperty({ example: '544398' })
  @Column({ nullable: true })
  pinCode: string;

  @ApiProperty({ example: 'I am a student' })
  @Column({ nullable: true })
  bio: string;

  @ApiProperty({ example: '10th' })
  @Column({ nullable: true })
  qualification: string;

  @ApiProperty({ example: 'diploma' })
  @Column({ nullable: true })
  otherQualification: string;

  @ApiProperty({ example: 'url' })
  @Column({ nullable: true })
  profileImage: string;

  @ApiProperty({ example: 'url' })
  @Column({ nullable: true })
  coverImage: string;

  @ApiProperty({ example: ['driving', 'coding'] })
  @Column('text', { array: true, default: () => 'ARRAY[]::text[]' })
  skills: string[];

  // @ManyToOne(() => Zone, (zone) => zone.id)
  // zone: Zone;

  // @Column({ nullable: true })
  // @RelationId((zone: Zone) => zone.id)
  // zoneId: number;

  // @ManyToOne(() => Region, (region) => region.id)
  // region: Region;

  // @Column({ nullable: true })
  // @RelationId((region: Region) => region.id)
  // regionId: number;

  @Column('smallint', { default: 0 })
  resetPasswordRequired: number;

  // @ManyToOne(() => Brand, (brandMaster) => brandMaster.id)
  // @JoinColumn({ name: 'brandId' })
  // brand: Brand;

  // @Column({ nullable: true })
  // @RelationId((profile: Profile) => profile.brand)
  // brandId: number;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ nullable: true, type: 'enum', enum: Platform })
  createdBy: string;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @Column('smallint', { default: 0 })
  eligiblePlacement: number;

  @Column('smallint', { default: 0 })
  registeredPlacement: number;
}
