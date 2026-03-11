import { BadRequestException, Injectable } from '@nestjs/common';
import { fetchPaymentReceiptDataByReceiptHeaderId } from 'src/common/external-services/aptrack-one/endpoints';
import { PaymentReceiptQueryDto } from './dto/payment-receipt-query.dto';
import { handleAxiosError } from 'src/common/helper/error.helper';
import { CloudLoggerService } from 'src/cloud-logger/cloud-logger.service';

@Injectable()
export class PaymentReceiptService {
  constructor(private cloudLoggerService: CloudLoggerService) {}

  private formatPaymentReceiptFeeDistribution(paymentReceiptData: any) {
    const FeeDistribution = [];
    const ReceiptFeeComponents = paymentReceiptData.ReceiptFeeComponents;

    ReceiptFeeComponents.forEach((item) => {
      FeeDistribution.push({
        FeeComponentType: item.FeeComponent,
        Amount: item.FeeComponentAmount,
      });
    });

    // Printing Single FeeComponent, If No BCChildDetailID
    if (ReceiptFeeComponents.length == 0) {
      FeeDistribution.push({
        FeeComponentType: `${paymentReceiptData.ReceiptLabelName}`,
        Amount: paymentReceiptData.Amount,
      });
    }

    if (paymentReceiptData.SERVICE > 0) {
      FeeDistribution.push({
        FeeComponentType: 'SERVICE',
        Amount: paymentReceiptData.SERVICE,
      });
    }

    if (paymentReceiptData.CESS > 0) {
      FeeDistribution.push({
        FeeComponentType: 'CESS',
        Amount: paymentReceiptData.CESS,
      });
    }

    if (paymentReceiptData.STSERVTAX > 0) {
      FeeDistribution.push({
        FeeComponentType: 'STSERVTAX',
        Amount: paymentReceiptData.STSERVTAX,
      });
    }

    if (paymentReceiptData.VAT > 0) {
      FeeDistribution.push({
        FeeComponentType: 'VAT',
        Amount: paymentReceiptData.VAT,
      });
    }

    if (paymentReceiptData.SBCESS > 0) {
      FeeDistribution.push({
        FeeComponentType: 'SBCESS',
        Amount: paymentReceiptData.SBCESS,
      });
    }

    if (paymentReceiptData.KKCESS > 0) {
      FeeDistribution.push({
        FeeComponentType: 'KKCESS',
        Amount: paymentReceiptData.KKCESS,
      });
    }

    if (paymentReceiptData.GST > 0) {
      FeeDistribution.push({
        FeeComponentType: 'GST',
        Amount: paymentReceiptData.GST,
      });
    }

    if (paymentReceiptData.KFC > 0) {
      FeeDistribution.push({
        FeeComponentType: 'KFC',
        Amount: paymentReceiptData.KFC,
      });
    }

    if (paymentReceiptData.IGST > 0 && paymentReceiptData.IGSTRates > 0) {
      FeeDistribution.push({
        FeeComponentType: 'IGST',
        Amount: paymentReceiptData.IGST,
      });
    }

    if (paymentReceiptData.CGST > 0 && paymentReceiptData.CGSTRates > 0) {
      FeeDistribution.push({
        FeeComponentType: 'CGST',
        Amount: paymentReceiptData.CGST,
      });
    }

    if (paymentReceiptData.SGST > 0 && paymentReceiptData.SGSTRates > 0) {
      FeeDistribution.push({
        FeeComponentType: 'SGST',
        Amount: paymentReceiptData.SGST,
      });
    }

    if (paymentReceiptData.UTGST > 0 && paymentReceiptData.UTGSTRates > 0) {
      FeeDistribution.push({
        FeeComponentType: 'UTGST',
        Amount: paymentReceiptData.UTGST,
      });
    }

    // Based upon payment method, need to show the corresponding value
    if (paymentReceiptData.IsCashPayment) {
      paymentReceiptData.CashAmount = paymentReceiptData.TotalAmount;
    } else if (paymentReceiptData.IsChequePayment) {
      paymentReceiptData.ChequeDraftAmount = paymentReceiptData.TotalAmount;
      paymentReceiptData.ChequeDraftNo = paymentReceiptData.ChequeDraftNo;
      paymentReceiptData.ChequeDraftDated = new Date(
        paymentReceiptData.ChequeDraftDated,
      ).toLocaleDateString('en-IN');
    } else if (paymentReceiptData.IsCardPayment) {
      paymentReceiptData.CreditDebitCardAmount = paymentReceiptData.TotalAmount;
    } else if (paymentReceiptData.IsOnlinePayment) {
      paymentReceiptData.OnlinePay = paymentReceiptData.TotalAmount;
    } else if (paymentReceiptData.IsEventVoucherPayment) {
      paymentReceiptData.ChequeDraftAmount = paymentReceiptData.TotalAmount;
      paymentReceiptData.ChequeDraftNo = 0;
    } else if (paymentReceiptData.IsSVCPayment) {
      paymentReceiptData.SVC = paymentReceiptData.TotalAmount;
      paymentReceiptData.OnlinePayUTR = paymentReceiptData.TransactionNo;
    } else if (paymentReceiptData.IsLoanPayment) {
      paymentReceiptData.SVC = paymentReceiptData.TotalAmount;
      paymentReceiptData.OnlinePayUTR = paymentReceiptData.TransactionNo;
    } else if (paymentReceiptData.IsOnlinePaymentExceptPG) {
      paymentReceiptData.OnlinePay = paymentReceiptData.TotalAmount;
      paymentReceiptData.OnlinePayUTR = paymentReceiptData.TransactionNo;
    }

    paymentReceiptData.IsCancelled = false;
    if (paymentReceiptData.ReceiptStatus === 'C') {
      paymentReceiptData.IsCancelled = true; // Set boolean to true if canceled
    }

    paymentReceiptData.FeeDistribution = FeeDistribution;

    return paymentReceiptData;
  }

  async fetchPaymentReceiptPayload(dto: PaymentReceiptQueryDto) {
    // call Aptrack2 for payload
    try {
      let paymentReceiptData = await fetchPaymentReceiptDataByReceiptHeaderId(
        dto.receiptHeaderId,
      );

      paymentReceiptData = Array.isArray(paymentReceiptData)
        ? paymentReceiptData[0]
        : paymentReceiptData;

      paymentReceiptData = this.formatPaymentReceiptFeeDistribution(paymentReceiptData);

      return paymentReceiptData;
    } catch (error) {
      handleAxiosError(
        `fetchPaymentReceiptPayload => receiptHeaderId: ${dto.receiptHeaderId}`,
        error,
        (message, data) => this.cloudLoggerService.error(message, data),
      );
    }
  }
}
