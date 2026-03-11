import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class ServiceAccess {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true }) // Makes the name field unique
  name: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  token: string;

  @Column({ type: 'jsonb', nullable: true })
  access: Object;
}
