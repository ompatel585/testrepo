import { PaymentGatewayBrandMapping } from 'src/common/entities/payment-gateway-brand-mapping.entity';
import {
  PaymentGateway,
  PaymentGatewayEnum,
} from 'src/common/entities/payment-gateway.entity';
import { Repository } from 'typeorm';
import { CCAvenuePayment } from './ccavenue-payment.util';
import { BusinessException } from 'src/common/exceptions/business.exception';
import { CryptoServiceUtil } from '../crypto-service.util';
import { AirPayPayment } from './airpay-payment.util';
import { Payment } from 'src/common/entities/payment.entity';
import { CloudLoggerService } from 'src/cloud-logger/cloud-logger.service';

export class PaymentBuilder {
  constructor(
    private readonly paymentGatewayBrandMapping: PaymentGatewayBrandMapping,
    private readonly paymentGatewayRepository: Repository<PaymentGateway>,
    private readonly cryptoService: CryptoServiceUtil,
    private readonly paymentRepository: Repository<Payment>,
    private readonly cloudLoggerService: CloudLoggerService,
  ) {}

  async build() {
    const paymentGateWay = await this.paymentGatewayRepository.findOneBy({
      id: this.paymentGatewayBrandMapping.paymentGatewayId,
    });

    switch (paymentGateWay.name) {
      case PaymentGatewayEnum.CCAvenue:
        return new CCAvenuePayment(
          this.paymentGatewayBrandMapping,
          this.cryptoService,
          this.paymentRepository,
          this.cloudLoggerService,
        );
      case PaymentGatewayEnum.AirPay:
        return new AirPayPayment(
          this.paymentGatewayBrandMapping,
          this.cryptoService,
          this.paymentRepository,
          this.cloudLoggerService,
        );
      default:
        throw new BusinessException('no payment gateway mapped with brand');
    }
  }
}
