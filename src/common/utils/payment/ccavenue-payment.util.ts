import { PaymentGatewayBrandMapping } from 'src/common/entities/payment-gateway-brand-mapping.entity';
import { PaymentInterface } from './payment-interface.util';
import { checkCCAvenueIsActive } from 'src/common/external-services/ccavenue/ccavenue-endpoints';
import { Payment } from 'src/common/entities/payment.entity';
import { User } from 'src/common/entities/user.entity';
import { jsonToQuerySting } from 'src/common/helper/object.helper';
import { CryptoServiceUtil } from '../crypto-service.util';
import { UserPGProfileType } from 'src/common/types';
import { PaymentGatewayEnum } from 'src/common/entities/payment-gateway.entity';
import { BusinessException } from 'src/common/exceptions/business.exception';
import { Repository } from 'typeorm';
import { sendPaymentRequestToAptrack } from 'src/common/external-services/aptrack-one/endpoints';
import { Logger } from '@nestjs/common';
import { APPLICATION_NAME, getAptrack2BrandIdList } from 'src/common/constants';
import { CloudLoggerService } from 'src/cloud-logger/cloud-logger.service';

export class CCAvenuePayment implements PaymentInterface {
  private optionMap = {
    upi: 'OPTUPI',
    debitCard: 'OPTDBCRD',
    creditCard: 'OPTCRDC',
    amexCard: '',
    netBanking: 'OPTNBK',
    wallet: '',
    cardEmi: 'OPTEMI',
  };
  private readonly logger = new Logger(CCAvenuePayment.name);

  constructor(
    private readonly paymentGatewayBrandMapping: PaymentGatewayBrandMapping,
    private readonly cryptoService: CryptoServiceUtil,
    private readonly paymentRepository: Repository<Payment>,
    private readonly cloudLoggerService: CloudLoggerService,
  ) {}

  async isActive() {
    try {
      await checkCCAvenueIsActive();

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
    const pg = this.paymentGatewayBrandMapping;
    const paymentOption = optionCode in this.optionMap ? this.optionMap[optionCode] : '';

    if (!paymentOption) {
      throw new BusinessException('unsupported option for payment gateway');
    }

    let SAP_Customer_Id = userDetail.SAP_Customer_Id;

    if (process.env.PAYMENT_ENV !== 'prod') {
      SAP_Customer_Id = '1004034';
    }

    const data = {
      merchant_id: pg.merchantId,
      order_id: payment.orderId,
      currency: 'INR',
      amount: payment.requestAmount,
      redirect_url: `${pg.details.redirect_url}`,
      cancel_url: `${pg.details.cancel_url}`,
      language: pg.details.language,
      upiPaymentFlag: pg.details.upiPaymentFlag,
      billing_name: userDetail.firstName,
      billing_address: userDetail.address,
      billing_city: userDetail.city,
      billing_state: userDetail.state,
      billing_zip: userDetail.pinCode,
      billing_country: userDetail.country,
      billing_tel: userDetail.mobile,
      billing_email: userDetail.email,
      delivery_name: userDetail.firstName,
      delivery_address: userDetail.address,
      delivery_city: userDetail.city,
      delivery_state: userDetail.state,
      delivery_zip: userDetail.pinCode,
      delivery_country: userDetail.country,
      delivery_tel: userDetail.mobile,
      payment_option: paymentOption,
      // pending
      merchant_param1: userDetail.I_Invoice_Header_ID, // I_Invoice_Header_ID will come from aptrack
      merchant_param2: user.userId,
      merchant_param3: userDetail.I_Enquiry_Region_ID, //I_Enquiry_Region_ID will come from aptrack
      merchant_param4: '2', // S_Receipt_Type 2 static
      merchant_param5: APPLICATION_NAME,
      sub_account_id: SAP_Customer_Id, // SAP_Customer_Id/sub_account_id will come from aptrack
    };

    const queryString = jsonToQuerySting(data);
    const encRequest = this.cryptoService.encrypt(queryString, pg.details.workingKey);

    const request = {
      action: process.env.CC_AVENUE_URL,
      data,
      encRequest,
      accessCode: pg.details.accessCode,
      pg: PaymentGatewayEnum.CCAvenue,
      clientOrigin: process.env.FRONTEND_URL,
    };

    payment.request = request;

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
      S_Payment_Gateway: PaymentGatewayEnum.CCAvenue,
      S_Crtd_By: APPLICATION_NAME,
      S_Student_Status: userDetail.Student_Status,
      I_Order_ID: payment.orderId,
    };

    // send PG req to aptrack

    // call without await to avoid blocking main thread
    sendPaymentRequestToAptrack(
      aptrackReq,
      userDetail.userReference.userRole[0].brand.key,
    )
      .then(() => {
        if (
          getAptrack2BrandIdList().includes(
            userDetail.userReference.userRole[0].brand.key,
          )
        ) {
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
        const stringPayload = JSON.stringify(aptrackReq);
        this.cloudLoggerService.error(
          'Initiate-Payment-CCAvenue:failed to send PG REQ to aptrack01',
          error.toString(),
        );
        if (
          getAptrack2BrandIdList().includes(
            userDetail.userReference.userRole[0].brand.key,
          )
        ) {
          this.logger.error(`sendPaymentRequestToAptrack02 : ${error.toString()}`);
          this.cloudLoggerService.error(
            `Initiate-Payment-CCAvenue:failed to send PG REQ to aptrack02: ${error.toString()} :  payload : ${stringPayload}`,
          );
        } else {
          this.logger.error(`sendPaymentRequestToAptrack01 : ${error.toString()}`);
          this.cloudLoggerService.error(
            `Initiate-Payment-CCAvenue:failed to send PG REQ to aptrack01: ${error.toString()} :  payload : ${stringPayload}`,
          );
        }
      });

    await this.paymentRepository.save(payment);

    return request;
  }
}
