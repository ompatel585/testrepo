import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  RelationId,
} from 'typeorm';
import { PaymentOption } from './paymentOption.entity';
import { PaymentGateway } from './payment-gateway.entity';

@Entity()
export class PaymentOptionPaymentGatewayMapping {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => PaymentOption, (option) => option.optionMapping, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  paymentOption: PaymentOption;

  @Column()
  @RelationId((mapping: PaymentOptionPaymentGatewayMapping) => mapping.paymentOption)
  paymentOptionId: number;

  @ManyToOne(() => PaymentGateway, (option) => option.optionMapping, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  paymentGateway: PaymentGateway;

  @Column()
  @RelationId((mapping: PaymentOptionPaymentGatewayMapping) => mapping.paymentGateway)
  paymentGatewayId: number;

  @Column({ type: 'int', nullable: false })
  order: number;
}
