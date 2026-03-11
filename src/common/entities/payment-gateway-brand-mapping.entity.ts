import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  RelationId,
} from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { PaymentGateway } from './payment-gateway.entity';
import { Payment } from './payment.entity';

@Entity()
export class PaymentGatewayBrandMapping extends AbstractEntity<PaymentGatewayBrandMapping> {
  @ManyToOne(
    () => PaymentGateway,
    (paymentGateway) => paymentGateway.paymentGatewayBrandMapping,
  )
  paymentGateway: PaymentGateway;

  @Column()
  @RelationId((mapping: PaymentGatewayBrandMapping) => mapping.paymentGateway)
  paymentGatewayId: number;

  @Column({ type: 'int' })
  merchantId: number;

  @Column({ type: 'int', array: true, default: () => "'{}'" })
  forBrand: number[];

  @Column({ type: 'jsonb', default: () => "'{}'::jsonb" })
  details: Record<string, any>;

  @OneToMany(() => Payment, (payment) => payment.paymentGatewayBrandMapping)
  payment: Payment[];

  @Column({ type: 'varchar', length: 255, nullable: true })
  status: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  universityTypeCode: string;
}
