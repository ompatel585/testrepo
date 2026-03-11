import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { Event } from './event.entity';

@Entity('centre_wall')
export class CentreWall extends AbstractEntity<CentreWall> {
  @Column({ nullable: true })
  centerId: number;

  @ManyToOne(() => Event)
  @JoinColumn({ name: 'eventId' })
  eventId: Event;

  @Column({ nullable: true })
  centerLogo: string;

  @Column({ type: 'text', array: true, nullable: true })
  centerMedia: string[];

  @Column({ type: 'text', nullable: true })
  cheerChant: string | null;
}
