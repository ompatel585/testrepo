import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  PaymentGateway,
  PaymentGatewayEnum,
} from 'src/common/entities/payment-gateway.entity';
import { Raw, Repository } from 'typeorm';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { ConfigService } from '@nestjs/config';
import { BusinessException } from 'src/common/exceptions/business.exception';
import {
  AptrackPaymentName,
  AptrackPaymentStatus,
  Payment,
  PaymentStatus,
} from 'src/common/entities/payment.entity';
import { User } from 'src/common/entities/user.entity';
import { jsonToQuerySting, queryStingToJson } from 'src/common/helper/object.helper';
import { CryptoServiceUtil } from 'src/common/utils/crypto-service.util';
import { PaymentOptionPaymentGatewayMapping } from 'src/common/entities/paymentOptionPaymentGatewayMapping.entity';
import { PaymentGatewayBrandMapping } from 'src/common/entities/payment-gateway-brand-mapping.entity';
import { PaymentBuilder } from 'src/common/utils/payment/payment-builder.util';
import { ProfileService } from 'src/profile/profile.service';
import { isStudentProfileResponse, isUserPGProfileType } from 'src/common/types/guard';
import { Role } from 'src/common/enum/role.enum';
import { CloudLoggerService } from 'src/cloud-logger/cloud-logger.service';
import { PaymentOption } from 'src/common/entities/paymentOption.entity';
import * as CRC32 from 'crc-32';
import {
  fetchStudentPaymentDetails,
  fetchStudentTransactionDetails,
  sendPaymentResponseToAptrack,
} from 'src/common/external-services/aptrack-one/endpoints';
import {
  IAptrackUserPaymentRes,
  IFormattedUserPayment,
} from './interfaces/aptrack-user-payment-res.interface';

import moment from 'moment';
import {
  CCAvenueStatus,
  mapCCAvenueStatusToPaymentStatus,
} from 'src/common/utils/payment/enums/ccavenue.status.enum';
import {
  AirpayNumericStatus,
  mapAirpayNumericStatusToPaymentStatus,
} from 'src/common/utils/payment/enums/airpay.status.enum';
import {
  IAptrackUserTransactionRes,
  IFormattedUserTransaction,
} from './interfaces/aptrack-user-transaction-res.interface';
import { validateUserPGMetaData } from 'src/common/helper/userPGMetaData.helper';
import {
  IAptrackStudentPGMetaData,
  UserMetaData,
} from 'src/common/entities/user-metadata.entity';
import { UserPGProfileType } from 'src/common/types';
import { MasterService } from 'src/master/master.service';
import { handleAxiosError } from 'src/common/helper/error.helper';
import { UsersService } from 'src/users/users.service';
import { getAptrack2BrandIdList } from 'src/common/constants';
import { DefaultUserResponse } from 'src/common/strategy/jwt.strategy';
@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  constructor(
    @InjectRepository(PaymentGateway)
    private paymentGatewayRepository: Repository<PaymentGateway>,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(PaymentOptionPaymentGatewayMapping)
    private paymentOptionPaymentGatewayMappingRepository: Repository<PaymentOptionPaymentGatewayMapping>,
    @InjectRepository(PaymentGatewayBrandMapping)
    private paymentGatewayBrandMappingRepository: Repository<PaymentGatewayBrandMapping>,
    @InjectRepository(PaymentOption)
    private paymentOptionRepository: Repository<PaymentOption>,

    private readonly masterService: MasterService,
    private readonly userService: UsersService,

    @InjectRepository(UserMetaData)
    private userMetaDataRepository: Repository<UserMetaData>,
    private readonly cryptoService: CryptoServiceUtil,
    private readonly profileService: ProfileService,
    private readonly cloudLoggerService: CloudLoggerService,
  ) {}

  async initiatePayment(
    req: any,
    user: DefaultUserResponse,
    initiatePaymentDto: InitiatePaymentDto,
  ) {
    const mappedPaymentGateways =
      await this.paymentOptionPaymentGatewayMappingRepository.find({
        where: { paymentOption: { id: initiatePaymentDto.paymentOptionId } },
        order: {
          order: 'ASC',
        },
      });

    if (mappedPaymentGateways.length == 0) {
      this.cloudLoggerService.error(
        'Payment Service',
        'No PG mapped with the selected payment option - ' +
          initiatePaymentDto.paymentOptionId,
      );
      throw new BusinessException(
        "This payment method isn't available right now. Please choose a different one",
      );
    }

    const option = await this.paymentOptionRepository.findOneBy({
      id: initiatePaymentDto.paymentOptionId,
    });
    const optionCode = option.code;

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const brandId = user.activeRole.brandId;

    for (const mappedPaymentGateway of mappedPaymentGateways) {
      if (user.activeRole.role != Role.Student) {
        this.cloudLoggerService.error(
          'Payment Service',
          'invalid user - ' + JSON.stringify(user),
        );
        throw new BusinessException(
          "We couldn't verify your details. Please log in again or contact support",
        );
      }

      const userMetaData = await this.userMetaDataRepository.findOneBy({
        userId: user.id,
      });

      if (
        !Array.isArray(userMetaData?.pgMetaData) ||
        userMetaData.pgMetaData.length === 0
      ) {
        this.cloudLoggerService.error(
          `Payment Service : invalid user ${JSON.stringify(req.user)} pgMetaData: ${JSON.stringify(userMetaData?.pgMetaData)}`,
        );

        throw new BusinessException(
          "We couldn't verify your details. Please log in again or contact support",
        );
      }

      const userPGMetaDataByBCNO = userMetaData.pgMetaData.find(
        (meta) => meta.BCNo === initiatePaymentDto.BCNO,
      );

      if (!userPGMetaDataByBCNO) {
        this.cloudLoggerService.error(
          `Payment Service : Invoice_Header_ID not found for user ${JSON.stringify(user.userId)} in pgMetaData`,
        );

        throw new BusinessException(
          "We couldn't verify your details. Please log in again or contact support",
        );
      }

      // validatedUserPGMetaData
      const validatedUserPGMetaData = validateUserPGMetaData(userPGMetaDataByBCNO);

      const userProfile = await this.profileService.getStudentOrFacultyProfile(user);

      let userDetails: UserPGProfileType = null;

      if (isStudentProfileResponse(userProfile)) {
        userDetails = {
          ...userProfile,
          I_Invoice_Header_ID: validatedUserPGMetaData.Invoice_Header_ID,
          I_Enquiry_Region_ID: validatedUserPGMetaData.Enquiry_Regn_ID,
          SAP_Customer_Id: validatedUserPGMetaData.SAP_Customer_Id,
          Student_Status: validatedUserPGMetaData.Student_Status,
          I_Student_Detail_ID: validatedUserPGMetaData.Student_Detail_ID,
          CenterId: validatedUserPGMetaData.CenterId,
        };
      } else {
        throw new BusinessException(
          "We couldn't verify your details. Please log in again or contact support",
        );
      }

      const universityTypeCode = userPGMetaDataByBCNO.UniversityCode || null;

      const paymentGatewayBrandMapping =
        await this.paymentGatewayBrandMappingRepository.findOne({
          where: {
            paymentGatewayId: mappedPaymentGateway.paymentGatewayId,
            forBrand: Raw((alias) => `${brandId} = ANY(${alias})`),
            status: userPGMetaDataByBCNO.Student_Status,
            universityTypeCode,
          },
        });

      if (!paymentGatewayBrandMapping) {
        this.cloudLoggerService.error(
          'Payment Service',
          mappedPaymentGateway.paymentGatewayId +
            ' PG not mapped with brand - ' +
            brandId,
        );
        throw new BusinessException(
          'Payment is unavailable at the moment. Please try again later.',
        );
      }

      const paymentObj = await new PaymentBuilder(
        paymentGatewayBrandMapping,
        this.paymentGatewayRepository,
        this.cryptoService,
        this.paymentRepository,
        this.cloudLoggerService,
      ).build();

      if (!(await paymentObj.isActive())) {
        continue;
      }

      const fetchedUser = await this.userRepository.findOneBy({ id: user.id });

      if (isUserPGProfileType(userDetails)) {
        const payment = await this.addPayment(
          paymentGatewayBrandMapping,
          fetchedUser,
          initiatePaymentDto,
        );

        const payload = await paymentObj.initiatePayment(
          payment,
          userDetails,
          optionCode,
          baseUrl,
          fetchedUser,
        );

        return payload;
      } else {
        this.cloudLoggerService.error(
          'Payment Service',
          'invalid userDetails - ' + JSON.stringify(req.user),
        );
        throw new BusinessException(
          "We couldn't verify your details. Please log in again or contact support",
        );
      }
    }

    this.cloudLoggerService.error('Payment Service', 'no PG is active now');
    throw new BusinessException(
      'We are currently experiencing payment issues. Please try again later',
    );
  }

  private mergePaymentResponse(oldRes: any, newRes: any) {
    return { ...(oldRes || {}), ...newRes };
  }

  async handleCCAvenuePaymentResponse(response: any) {
    const { encResp, orderNo, order_id } = response;

    let payment = await this.paymentRepository.findOne({
      where: {
        orderId: orderNo || order_id,
      },
      relations: {
        paymentGatewayBrandMapping: true,
        user: { userRole: { brand: true } },
        paymentOption: true,
      },
    });

    if (!payment) {
      this.cloudLoggerService.error(
        'handlePaymentResponse',
        'Invalid Order Id - ' + JSON.stringify(response),
      );
      throw new BusinessException('Invalid Order Id');
    }

    const decryptedResponse = this.cryptoService.decrypt(
      encResp,
      payment.paymentGatewayBrandMapping.details.workingKey,
    );

    const jsonObject = queryStingToJson(decryptedResponse);

    // send response to aptrack

    // brandCode
    // const userBrandData = await this.masterService.getBrandByUserId(payment.user.id);
    const userBrandData = await this.masterService.getBrandById(
      payment.user.userRole[0].brandId,
    );

    const userMetaData = await this.userMetaDataRepository.findOneBy({
      userId: payment.user.id,
    });

    const userPGMetaDataByBCNO = userMetaData.pgMetaData.find(
      (meta) => meta.BCNo === payment.BCNO,
    );

    let TranCenterId = null;

    if (!userPGMetaDataByBCNO || !userPGMetaDataByBCNO?.CenterId) {
      TranCenterId = 0;
      this.cloudLoggerService.error(
        `Payment Service : Invoice_Header_ID not found for user ${JSON.stringify(payment.user.userId)} in pgMetaData`,
      );
    } else {
      TranCenterId = userPGMetaDataByBCNO.CenterId;
    }

    const aptrack01PGRes: Partial<IAptrack01PaymentResponse> = {
      I_Payment_ID: payment.id,
      S_Response: '',
      S_Payment_Gateway: PaymentGatewayEnum.CCAvenue,
      OrderID: payment.orderId,
      TrackingId: jsonObject.tracking_id,
      BankRefNo: jsonObject.bank_ref_no,
      OrderStatus:
        PaymentStatus[
          mapCCAvenueStatusToPaymentStatus(jsonObject.order_status as CCAvenueStatus)
        ],
      FailureMessage: jsonObject.failure_message,
      PaymentMode: payment?.paymentOption?.name || jsonObject.payment_mode,
      CardName: jsonObject.card_name,
      StatusCode: jsonObject.status_code,
      StatusMessage: jsonObject.status_message,
      Currency: jsonObject.currency,
      Amount: jsonObject.amount,
      Vault: jsonObject.vault,
      OfferType: jsonObject.offer_type,
      OfferCode: jsonObject.offer_code,
      DiscountValue: jsonObject.discount_value,
      // vault: jsonObject.vault,
      // billing_name: jsonObject.billing_name,
      // billing_address: jsonObject.billing_address,
      // billing_state: jsonObject.billing_state,
      // billing_email: jsonObject.billing_email,
      // billing_country: jsonObject.billing_country,
      // billing_city: jsonObject.billing_city,
      // billing_tel: jsonObject.billing_tel,
      // billing_zip: jsonObject.billing_zip,
      // delivery_name: jsonObject.delivery_name,
      // delivery_address: jsonObject.delivery_name,
      // delivery_city: jsonObject.delivery_city,
      // delivery_state: jsonObject.delivery_state,
      // delivery_zip: jsonObject.delivery_zip,
      // delivery_country: jsonObject.delivery_country,
      // delivery_tel: jsonObject.delivery_tel,
      // merchant_param1: jsonObject.merchant_param1,
      // merchant_param2: jsonObject.merchant_param2,
      // merchant_param3: jsonObject.merchant_param3,
      // merchant_param4: jsonObject.merchant_param4,
      // merchant_param5: jsonObject.merchant_param5,
      // mer_amount: jsonObject.mer_amount,
      // eci_value: jsonObject.eci_value,
      // retry: jsonObject.retry,
      // trans_date: jsonObject.trans_date,
      // response_code: jsonObject.response_code,
      // billing_notes: jsonObject.billing_notes,
      // Brand: userBrandData.brand.key,
      // TranCenterId: TranCenterId, // pending
      // TransactionStatus: jsonObject.order_status,
      // AptransactionId: '',
      // Message: jsonObject.status_message,
      // TransactionId: jsonObject.tracking_id,
      // Ap_SecureHash: '',
      Privatekey: '',
      Checksum: '',
    };

    this.sendPGResToAptrack(aptrack01PGRes, userBrandData.key);

    payment = this.paymentRepository.create({
      ...payment,
      transactionId: jsonObject.tracking_id,
      receivedAmount: jsonObject.amount,
      failMessage: jsonObject.failure_message,
      response: jsonObject,
      // response: this.mergePaymentResponse(payment.response, jsonObject),
      pgOrderStatus: jsonObject.order_status,
      status: mapCCAvenueStatusToPaymentStatus(jsonObject.order_status as CCAvenueStatus),
    });

    return await this.paymentRepository.save(payment);
  }

  async addPayment(
    paymentGatewayBrandMapping: PaymentGatewayBrandMapping,
    user: User,
    initiatePaymentDto: InitiatePaymentDto,
  ) {
    let payment = this.paymentRepository.create({
      requestAmount: initiatePaymentDto.amount,
      paymentGatewayBrandMapping,
      user,
      BCNO: initiatePaymentDto.BCNO,
      paymentOption: { id: initiatePaymentDto.paymentOptionId },
    });

    payment = await this.paymentRepository.save(payment);
    payment = await this.paymentRepository.findOne({
      where: {
        id: payment.id,
      },
      relations: {
        paymentOption: true,
      },
    });
    return payment;
  }

  async handleAirPayPaymentResponse(response: any) {
    let {
      TRANSACTIONPAYMENTSTATUS,
      TRANSACTIONID,
      APTRANSACTIONID,
      AMOUNT,
      TRANSACTIONSTATUS,
      TRANSACTIONTIME,
      MESSAGE,
      CUSTOMERVPA,
      CHMOD,
      ap_SecureHash,
    } = response;

    let payment = await this.paymentRepository.findOne({
      where: {
        orderId: TRANSACTIONID,
      },
      relations: {
        paymentGatewayBrandMapping: true,
        user: { userRole: { brand: true } },
        paymentOption: true,
      },
    });

    if (!payment) {
      this.cloudLoggerService.error(
        'handleAirPayPaymentResponse',
        'Invalid Order Id - ' + JSON.stringify(response),
      );
      throw new BusinessException('Invalid TRANSACTIONID');
    }

    let txnhash = CRC32.str(
      `${TRANSACTIONID}:${APTRANSACTIONID}:${AMOUNT}:${TRANSACTIONSTATUS}:${MESSAGE}:${payment.paymentGatewayBrandMapping.details.mid}:${payment.paymentGatewayBrandMapping.details.username}`,
    );

    if (CHMOD === 'upi' && CUSTOMERVPA) {
      txnhash = CRC32.str(
        `${TRANSACTIONID}:${APTRANSACTIONID}:${AMOUNT}:${TRANSACTIONSTATUS}:${MESSAGE}:${payment.paymentGatewayBrandMapping.details.mid}:${payment.paymentGatewayBrandMapping.details.username}:${CUSTOMERVPA}`,
      );
    }

    txnhash = txnhash >>> 0;

    if (txnhash.toString() !== ap_SecureHash) {
      this.cloudLoggerService.error(
        'handleAirPayPaymentResponse',
        'Invalid Hashed - ' + JSON.stringify(response),
      );
      throw new BusinessException('Invalid Hashed');
    }

    // send response to aptrack

    const numericCode = Number(response.TRANSACTIONSTATUS);

    // brandCode
    // const userBrandData = await this.masterService.getBrandByUserId(payment.user.id);
    const userBrandData = await this.masterService.getBrandById(
      payment.user.userRole[0].brandId,
    );

    const userMetaData = await this.userMetaDataRepository.findOneBy({
      userId: payment.user.id,
    });

    const userPGMetaDataByBCNO = userMetaData.pgMetaData.find(
      (meta) => meta.BCNo === payment.BCNO,
    );

    let TranCenterId = null;

    if (!userPGMetaDataByBCNO || !userPGMetaDataByBCNO?.CenterId) {
      TranCenterId = 0;
      this.cloudLoggerService.error(
        `Payment Service : BCNO not found for user ${JSON.stringify(payment.user.userId)} in pgMetaData`,
      );
    } else {
      TranCenterId = userPGMetaDataByBCNO.CenterId;
    }

    // pending re validate if sensing all fields
    const aptrack01PGRes: IAptrack01PaymentResponse = {
      I_Payment_ID: payment.id,
      S_Response: '',
      S_Payment_Gateway: PaymentGatewayEnum.AirPay,
      OrderID: payment.orderId,
      TrackingId: null,
      BankRefNo: null,
      OrderStatus:
        PaymentStatus[
          mapAirpayNumericStatusToPaymentStatus(numericCode as AirpayNumericStatus)
        ],
      FailureMessage: '',
      PaymentMode: payment?.paymentOption?.name || response.CHMOD,
      CardName: payment?.paymentOption?.name || response.CHMOD,
      StatusCode: response.TRANSACTIONSTATUS,
      StatusMessage: '',
      Vault: null,
      Currency: response?.CURRENCYCODE || '',
      OfferType: '',
      OfferCode: '',
      DiscountValue: '',
      vault: null,
      billing_name: response?.CUSTOMER || '',
      billing_address: '',
      billing_state: '',
      billing_email: response?.CUSTOMEREMAIL || '',
      billing_country: '',
      billing_city: '',
      billing_tel: '',
      billing_zip: '',
      delivery_name: response?.CUSTOMER || '',
      delivery_address: '',
      delivery_city: '',
      delivery_state: '',
      delivery_zip: '',
      delivery_country: '',
      delivery_tel: '',
      merchant_param1: '',
      merchant_param2: '',
      merchant_param3: '',
      merchant_param4: '',
      merchant_param5: '',
      mer_amount: response.AMOUNT,
      eci_value: null,
      retry: null,
      trans_date: response?.TRANSACTIONTIME || '',
      response_code: response?.TRANSACTIONSTATUS || '',
      billing_notes: '',
      Brand: userBrandData.key,
      TranCenterId: TranCenterId,
      TransactionStatus: response?.TRANSACTIONSTATUS || '',
      AptransactionId: response.APTRANSACTIONID,
      Message:
        PaymentStatus[
          mapAirpayNumericStatusToPaymentStatus(numericCode as AirpayNumericStatus)
        ], // aptrack is taking Transaction Status value from Message
      TransactionId: response.APTRANSACTIONID,
      Amount: response.AMOUNT,
      Ap_SecureHash: response.ap_SecureHash,
      Privatekey: payment.request.privatekey,
      Checksum: payment.request.checksum,
    };

    this.sendPGResToAptrack(aptrack01PGRes, userBrandData.key);

    payment = this.paymentRepository.create({
      ...payment,
      transactionId: APTRANSACTIONID,
      receivedAmount: AMOUNT,
      failMessage: MESSAGE,
      response: response,
      pgOrderStatus: TRANSACTIONPAYMENTSTATUS ?? AirpayNumericStatus[TRANSACTIONSTATUS],
      status: mapAirpayNumericStatusToPaymentStatus(numericCode as AirpayNumericStatus),
    });

    return await this.paymentRepository.save(payment);
  }

  private formatUserPaymentData = (
    paymentData: IAptrackUserPaymentRes[],
  ): IFormattedUserPayment[] => {
    return paymentData.map((item) => ({
      BCNo: item.BCNo,
      BCDate: moment(item.BCDate, 'DD-MMM-YYYY HH:mm:ss').format('YYYY-MM-DD'),
      BCActiveStatus: item.BCStatus,
      BCAmount: parseFloat(item.BCAmount),
      totalPaidAmount: parseFloat(item.ReceiptAmount),
      outstandingAmount: parseFloat(item.OutstandingAmount),
      pendingAmount: parseFloat(item.PendingAmount),
      BCFeeStatus: item.FeeStatus,
      monthlyFeesStatus:
        parseFloat(item.OutstandingAmount) === 0
          ? 'Paid'
          : parseFloat(item.PendingAmount) < 1
            ? 'Paid'
            : 'Pending',
      Invoice_Header_ID: item.Invoice_Header_ID,
    }));
  };

  private formatUserTransactionData = (
    transactionData: IAptrackUserTransactionRes[],
  ): IFormattedUserTransaction[] => {
    const excludeStatuses = [
      AptrackPaymentStatus.NO_RES_FROM_BANK.toLowerCase(),
      AptrackPaymentStatus.PENDING.toLowerCase(),
    ];

    const filteredPaymentData = transactionData.filter((item) => {
      return !excludeStatuses.includes(item.Transaction_Status.toLowerCase());
    });

    return filteredPaymentData.map((item) => ({
      transactionId: item.Transaction_Id,
      transactionDate: item.Transaction_date
        ? moment(item.Transaction_date, 'M/D/YYYY hh:mm:ss A').format(
            'DD-MM-YYYY HH:mm:ss',
          )
        : '',
      bankRefNo:
        !item.Bank_Ref_No || item.Bank_Ref_No == 'null' ? null : item.Bank_Ref_No,
      PG: item.Payment_Gateway,
      transactionAmount: item.Transaction_Amount,
      transactionStatus: item.Transaction_Status,
      userId: item.Student_ID,
      userName: item.Student_Name,
      receiptNo: item.Receipt_No,
      receiptDate: item.Receipt_Date
        ? moment(item.Receipt_Date, 'M/D/YYYY hh:mm:ss A').format('DD-MM-YYYY HH:mm:ss')
        : '',
      receiptAmount: item.Receipt_Amount,
      receiptHeaderId: item?.ReceiptHeaderId || null,
      receiptStatus: item.Receipt_Status,
      invoiceNo: item.Invoice_No,
      paymentModeName:
        item.PaymentMode_Name === AptrackPaymentName.UNIFIED_PAYMENTS
          ? 'UPI'
          : item.PaymentMode_Name,
    }));
  };

  private async sendPGResToAptrack(
    payload: Partial<IAptrack01PaymentResponse>,
    brandKey: number,
  ) {
    sendPaymentResponseToAptrack(payload, brandKey)
      .then((response) => {
        this.paymentRepository.update(
          { id: payload.I_Payment_ID },
          { aptrack01Response: response },
        );
        if (getAptrack2BrandIdList().includes(brandKey)) {
          this.logger.log(
            `Successfully sendPGResToAptrack02: I_Order_ID: ${payload.OrderID}`,
          );
        } else {
          this.logger.log(
            `Successfully sendPGResToAptrack01: I_Order_ID: ${payload.OrderID}`,
          );
        }
      })
      .catch((error) => {
        const stringPayload = JSON.stringify(payload);
        if (getAptrack2BrandIdList().includes(brandKey)) {
          this.logger.error(`failed to send PG res to aptrack02: ${error.toString()}`);
          this.cloudLoggerService.error(
            `failed to send PG res to aptrack02: ${error.toString()} :  payload : ${stringPayload}`,
          );
        } else {
          this.logger.error(`failed to send PG res to aptrack01: ${error.toString()}`);
          this.cloudLoggerService.error(
            `failed to send PG res to aptrack01: ${error.toString()} :  payload : ${stringPayload}`,
          );
        }
      });
  }

  async getMyPayments(
    user: DefaultUserResponse,
  ): Promise<{ payments: IFormattedUserPayment[]; count: number }> {
    try {
      const brand = await this.masterService.getBrandById(user.activeRole.brandId);
      const paymentData: IAptrackStudentPGMetaData[] = await fetchStudentPaymentDetails(
        user.userId,
        brand.key,
      );

      await this.userService.addUpdateUsePGMetaData(user.id, paymentData);

      const formattedData = this.formatUserPaymentData(
        paymentData as unknown as IAptrackUserPaymentRes[],
      );

      return { payments: formattedData, count: formattedData.length };
    } catch (error) {
      this.logger.error(`failed to fetch payment details: ${user?.userId} :${error}`);
      this.cloudLoggerService.error(
        `Failed to fetch payment details: ${user?.userId} :${error.toString()}`,
      );
      return { payments: [], count: 0 };
    }
  }

  async getMyTransactions(
    user: DefaultUserResponse,
  ): Promise<{ transactions: IFormattedUserTransaction[]; count: number }> {
    try {
      const brand = await this.masterService.getBrandById(user.activeRole.brandId);

      const transactionData: IAptrackUserTransactionRes[] =
        await fetchStudentTransactionDetails(user.userId, brand.key);

      const formattedData = this.formatUserTransactionData(transactionData);
      return { transactions: formattedData, count: transactionData.length || 0 };
    } catch (error) {
      handleAxiosError(
        `Error in getMyTransactions => ${user?.userId}`,
        error,
        (message, data) => this.cloudLoggerService.error(message, data),
      );
      return { transactions: [], count: 0 };
    }
  }
}
