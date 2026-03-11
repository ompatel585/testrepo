import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
} from 'typeorm';
import { User } from './user.entity';
import { PaymentGatewayBrandMapping } from './payment-gateway-brand-mapping.entity';
import { PaymentOption } from './paymentOption.entity';
import { v4 as uuidv4 } from 'uuid';

export enum PaymentStatus {
  INITIATE = 1,
  SUCCESS = 2,
  FAILED = 3,
  CANCELLED = 4,
  PENDING = 5,
  TIMEOUT = 6,
  REVERSED = 7,
  INVALID = 8,
}

export enum AptrackPaymentStatus {
  NO_RES_FROM_BANK = 'no response from bank',
  PENDING = 'PENDING',
}

export enum AptrackPaymentName {
  UNIFIED_PAYMENTS = 'Unified Payments',
}
@Entity()
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  requestAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  receivedAmount: number;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.INITIATE })
  status: PaymentStatus;

  // status from PG for reference purpose
  @Column({ type: 'varchar', nullable: true })
  pgOrderStatus: string;

  @Column({ type: 'varchar' })
  BCNO: string;

  @ManyToOne(() => PaymentOption, (option) => option.paymentMapping)
  paymentOption: PaymentOption;

  @Column({ type: 'text', nullable: true })
  failMessage: string;

  @Column({ type: 'jsonb', nullable: true })
  request: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  response: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  aptrack01Response: Record<string, any>;

  @Column({ type: 'varchar', length: 255, nullable: true })
  transactionId: string;

  @ManyToOne(() => PaymentGatewayBrandMapping, (pg) => pg.payment)
  paymentGatewayBrandMapping: PaymentGatewayBrandMapping;

  @ManyToOne(() => User, (user) => user.payment)
  @JoinColumn()
  user: User;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({
    nullable: true,
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @Column({ type: 'uuid', unique: true, nullable: true })
  orderId: string | null;

  @BeforeInsert()
  generateOrderId() {
    if (!this.orderId) {
      this.orderId = uuidv4();
    }
  }
}
