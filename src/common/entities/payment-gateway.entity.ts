import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Payment } from './payment.entity';
import { PaymentOptionPaymentGatewayMapping } from './paymentOptionPaymentGatewayMapping.entity';
import { PaymentGatewayBrandMapping } from './payment-gateway-brand-mapping.entity';

export enum PaymentGatewayEnum {
  CCAvenue = 'CCAVENUE',
  AirPay = 'AIRPAY',
}

@Entity()
export class PaymentGateway {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: PaymentGatewayEnum,
    default: PaymentGatewayEnum.CCAvenue,
  })
  name: PaymentGatewayEnum;

  @OneToMany(
    () => PaymentGatewayBrandMapping,
    (paymentGatewayBrandMapping) => paymentGatewayBrandMapping.paymentGateway,
  )
  paymentGatewayBrandMapping: PaymentGatewayBrandMapping[];

  @OneToMany(
    () => PaymentOptionPaymentGatewayMapping,
    (mapping) => mapping.paymentGateway,
  )
  optionMapping: PaymentOptionPaymentGatewayMapping[];
}
