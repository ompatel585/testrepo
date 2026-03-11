import { Payment } from 'src/common/entities/payment.entity';
import { PaymentInterface } from './payment-interface.util';
import { UserPGProfileType } from 'src/common/types';
import { PaymentGatewayBrandMapping } from 'src/common/entities/payment-gateway-brand-mapping.entity';
import { CryptoServiceUtil } from '../crypto-service.util';
import { format } from 'date-fns';
import { checkAirPayIsActive } from 'src/common/external-services/airpay/airpay-endpoint';
import { BusinessException } from 'src/common/exceptions/business.exception';
import { PaymentGatewayEnum } from 'src/common/entities/payment-gateway.entity';
import { User } from 'src/common/entities/user.entity';
import { Repository } from 'typeorm';
import { sendPaymentRequestToAptrack } from 'src/common/external-services/aptrack-one/endpoints';
import { Logger } from '@nestjs/common';
import { APPLICATION_NAME, getAptrack2BrandIdList } from 'src/common/constants';
import { CloudLoggerService } from 'src/cloud-logger/cloud-logger.service';

export class AirPayPayment implements PaymentInterface {
  private optionMap = {
    upi: 'upi',
    debitCard: 'pgdc',
    creditCard: 'pgcc',
    netBanking: 'nb',
    amexCard: '',
    wallet: 'ppc',
    cardEmi: 'emi',
  };

  private readonly logger = new Logger(AirPayPayment.name);

  constructor(
    private readonly paymentGatewayBrandMapping: PaymentGatewayBrandMapping,
    private readonly cryptoService: CryptoServiceUtil,
    private readonly paymentRepository: Repository<Payment>,
    private readonly cloudLoggerService: CloudLoggerService,
  ) {}
  async isActive() {
    try {
      await checkAirPayIsActive();

      return true;
    } catch (error) {
      return false;
    }
  }

  async initiatePayment(
    payment: Payment,
    userDetail: UserPGProfileType,
    optionCode: string,
    baseUrl: string,
    user: User,
  ) {
    const now = new Date();
    const buyerEmail = userDetail.email || '';
    const buyerFirstName = userDetail.firstName || '';
    const buyerLastName = userDetail.lastName || '';
    const buyerAddress = userDetail.address || '';
    const buyerCity = userDetail.city || '';
    const buyerState = userDetail.state || '';
    const buyerCountry = userDetail.country || '';
    const { requestAmount: amount, id: orderid } = payment;
    const pg = this.paymentGatewayBrandMapping;
    const paymentOption = optionCode in this.optionMap ? this.optionMap[optionCode] : '';

    if (!paymentOption) {
      throw new BusinessException('unsupported option for payment gateway');
    }

    const alldata =
      buyerEmail +
      buyerFirstName +
      buyerLastName +
      buyerAddress +
      buyerCity +
      buyerState +
      buyerCountry +
      amount +
      orderid;
    const udata = `${pg.details.username}:|:${pg.details.password}`;
    const privatekey = this.cryptoService.sha256(`${pg.details.secret}@${udata}`);
    const keySha256 = this.cryptoService.sha256(
      `${pg.details.username}~:~${pg.details.password}`,
    );
    const dateString = format(now, 'yyyy-MM-dd');
    const aldata = alldata + dateString;
    const checksum = this.cryptoService.sha256(`${keySha256}@${aldata}`);

    const request = {
      action: 'https://payments.airpay.co.in/pay/index.php',
      mercid: pg.details.mid,
      data: {
        buyerEmail,
        buyerFirstName,
        buyerLastName,
        buyerAddress,
        buyerCity,
        buyerState,
        buyerCountry,
        orderid,
        amount,
        chmod: paymentOption,
        currency: pg.details.currency,
        isocurrency: pg.details.isocurrency,
        // pending
        customvar:
          userDetail.SAP_Customer_Id + '|' + user.userId + '|' + APPLICATION_NAME, // SAPCustomerID will come from aptrack
      },
      privatekey,
      checksum,
      pg: PaymentGatewayEnum.AirPay,
      clientOrigin: process.env.FRONTEND_URL,
    };

    // send encRequest request to aptrack with credentials
    const aptrackReq: IAptrack01PaymentRequest = {
      I_Enquiry_Region_ID: parseInt(userDetail.I_Enquiry_Region_ID),
      I_Student_Detail_ID: parseInt(userDetail.I_Student_Detail_ID),
      I_Invoice_Header_ID: userDetail.I_Invoice_Header_ID,
      I_Receipt_Type: 2,
      S_Student_Name: userDetail.firstName,
      S_Email_ID: userDetail.email,
      S_Mobile_No: userDetail.mobile,
      N_Amount: payment.requestAmount,
      I_Centre_ID: userDetail.CenterId,
      S_Payment_Mode: payment?.paymentOption?.name || paymentOption,
      S_Payment_Gateway: PaymentGatewayEnum.AirPay,
      S_Crtd_By: APPLICATION_NAME,
      S_Student_Status: userDetail.Student_Status,
      I_Order_ID: payment.orderId,
    };

    // send PG req to aptrack

    // call without await to avoid blocking main thread
    sendPaymentRequestToAptrack(aptrackReq, userDetail.userReference.userRole[0].brand.key)
      .then(() => {
        if (getAptrack2BrandIdList().includes(userDetail.userReference.userRole[0].brand.key)) {
          this.logger.log(
            `Successfully sendPaymentRequestToAptrack02: I_Order_ID: ${aptrackReq.I_Order_ID}`,
          );
        } else {
          this.logger.log(
            `Successfully sendPaymentRequestToAptrack01: I_Order_ID: ${aptrackReq.I_Order_ID}`,
          );
        }
      })
      .catch((error) => {
        this.cloudLoggerService.error(
          `Initiate-Payment-Airpay:failed to send PG REQ to aptrack01: ${error}`,
        );
        if (getAptrack2BrandIdList().includes(userDetail.userReference.userRole[0].brand.key)) {
          this.logger.error(
            `Aptrack2.0 PG req API: sendPaymentRequestToAptrack02: ${error}`,
          );
        } else {
          this.logger.error(
            `Aptrack1.0 PG req API: sendPaymentRequestToAptrack01: ${error}`,
          );
        }
      });

    payment.request = request;

    await this.paymentRepository.save(payment);

    return request;
  }
}
