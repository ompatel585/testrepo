import { PaymentStatus } from 'src/common/entities/payment.entity';

export enum CCAvenueStatus {
  SUCCESS = 'Success',
  FAILURE = 'Failure',
  ABORTED = 'Aborted',
  INVALID = 'Invalid',
  TIMEOUT = 'Timeout',
  AUTO_REVERSED = 'Auto-Reversed', // from reconciliation
}

export const mapCCAvenueStatusToPaymentStatus = (
  status: CCAvenueStatus,
): PaymentStatus => {
  switch (status) {
    case CCAvenueStatus.SUCCESS:
      return PaymentStatus.SUCCESS;
    case CCAvenueStatus.FAILURE:
      return PaymentStatus.FAILED;
    case CCAvenueStatus.ABORTED:
      return PaymentStatus.CANCELLED;
    case CCAvenueStatus.INVALID:
      return PaymentStatus.INVALID;
    case CCAvenueStatus.TIMEOUT:
      return PaymentStatus.TIMEOUT;
    case CCAvenueStatus.AUTO_REVERSED:
      return PaymentStatus.REVERSED;
    default:
      return PaymentStatus.FAILED;
  }
};
