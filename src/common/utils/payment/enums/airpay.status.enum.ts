import { PaymentStatus } from 'src/common/entities/payment.entity';
/**
 * Alphanumeric statuses (for audit/display only).
 */
enum AirpayStatus {
  SUCCESS = 'SUCCESS',
  IN_PROCESS = 'TRANSACTION IN PROCESS',
  FAILED = 'FAILED',
  DROPPED = 'DROPPED',
  CANCELLED = 'CANCEL',
  INCOMPLETE = 'INCOMPLETE',
  BOUNCED = 'BOUNCED',
  RISK = 'RISK',
  NO_RECORDS = 'NO RECORDS',
}

/**
 * Numeric statuses (the authoritative source-of-truth for business logic).
 */
export enum AirpayNumericStatus {
  SUCCESS = 200,
  IN_PROCESS = 211,
  FAILED = 400,
  DROPPED = 401,
  CANCELLED_402 = 402,
  CANCELLED_502 = 502,
  INCOMPLETE = 403,
  BOUNCED = 405,
  NO_RECORDS = 503,
}

/**
 * Map the numeric Airpay status code to internal PaymentStatus.
 */
export const mapAirpayNumericStatusToPaymentStatus = (code: number): PaymentStatus => {
  switch (code) {
    case AirpayNumericStatus.SUCCESS:
      return PaymentStatus.SUCCESS;

    case AirpayNumericStatus.IN_PROCESS:
    case AirpayNumericStatus.INCOMPLETE:
      return PaymentStatus.PENDING;

    case AirpayNumericStatus.FAILED:
    case AirpayNumericStatus.BOUNCED:
    case AirpayNumericStatus.NO_RECORDS:
      return PaymentStatus.FAILED;

    case AirpayNumericStatus.CANCELLED_402:
    case AirpayNumericStatus.CANCELLED_502:
    case AirpayNumericStatus.DROPPED:
      return PaymentStatus.CANCELLED;

    default:
      return PaymentStatus.FAILED;
  }
};
