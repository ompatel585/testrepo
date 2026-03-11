import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';
import { AbstractEntity } from './abstract.entity';

@Entity()
export class Organization extends AbstractEntity<Organization> {
  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @OneToMany((type) => User, (user) => user.organization)
  user: User[];
}
