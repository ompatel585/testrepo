import { Payment } from 'src/common/entities/payment.entity';
import { User } from 'src/common/entities/user.entity';
import { ProfileResponseType } from 'src/common/types';

export interface PaymentInterface {
  isActive();
  initiatePayment(
    payment: Payment,
    userDetail: ProfileResponseType,
    optionCode: string,
    baseUrl: string,
    user: User,
  ): any;
}
