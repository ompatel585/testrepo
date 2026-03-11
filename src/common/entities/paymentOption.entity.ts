import { Check, Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { PaymentOptionPaymentGatewayMapping } from './paymentOptionPaymentGatewayMapping.entity';
import { Payment } from './payment.entity';

@Entity()
@Check(`"status" IN (0, 1)`)
export class PaymentOption {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, unique: true })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  code: string;

  @Column({ type: 'int', nullable: true })
  groupLevel: number;

  @Column('smallint', { default: 1 })
  status: number;

  @Column({ default: null })
  iconUrl: string;

  @OneToMany(() => PaymentOptionPaymentGatewayMapping, (mapping) => mapping.paymentOption)
  optionMapping: PaymentOptionPaymentGatewayMapping[];

  @OneToMany(() => Payment, (payment) => payment.paymentOption)
  paymentMapping: Payment[];
}
