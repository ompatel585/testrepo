import { Body, Controller, Get, Post, Query, Req, Res } from '@nestjs/common';
import { Public } from 'src/common/decorator/public.decorator';
import { Request, Response } from 'express';
import { ResponseHelper } from 'src/common/helper/response.helper';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { PaymentService } from './payment.service';
import { PaymentStatus } from 'src/common/entities/payment.entity';
import { Roles } from 'src/common/decorator/roles.decorator';
import { Role } from 'src/common/enum/role.enum';
import { getAptrack2BrandIdList, getFrontendRoute } from 'src/common/constants';
import { PaymentReceiptService } from './payment-receipt.service';
import {
  PermissionErrorMessagesEnum,
  PermissionException,
} from 'src/common/exceptions/permission.exception';
import { PaymentReceiptQueryDto } from './dto/payment-receipt-query.dto';
import { DefaultUserResponse } from 'src/common/strategy/jwt.strategy';
import { DefaultUser } from 'src/common/decorator/default-user.decorator';
import { MasterService } from 'src/master/master.service';

@Controller('payment')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly paymentReceiptService: PaymentReceiptService,
    private readonly masterService: MasterService,
  ) {}

  @Roles(Role.Student)
  @Get()
  async getMyPaymentDetails(@DefaultUser() user: DefaultUserResponse) {
    try {
      const { payments, count } = await this.paymentService.getMyPayments(user);
      return new ResponseHelper(payments, count);
    } catch (error) {
      console.log('PaymentController->getMyPayment', error);
      throw error;
    }
  }

  @Roles(Role.Student)
  @Post('initiate')
  async initiatePayment(
    @Req() req: Request,
    @DefaultUser() user: DefaultUserResponse,
    @Body() initiatePaymentDto: InitiatePaymentDto,
  ) {
    try {
      return new ResponseHelper(
        await this.paymentService.initiatePayment(req, user, initiatePaymentDto),
      );
    } catch (error) {
      console.log('PaymentController->initiatePayment', error);
      throw error;
    }
  }

  // to run locally uncomment Public flag and comment Role.Service
  // @Public()
  @Roles(Role.Service)
  @Post('cc-avenue/response')
  async handlePaymentResponse(@Res() res: Response, @Body() body: any) {
    try {
      const payment = await this.paymentService.handleCCAvenuePaymentResponse(body);
      const status = PaymentStatus[payment.status];

      res.redirect(`${getFrontendRoute().AcademicsFeesRoute}?status=${status}`);
    } catch (error) {
      console.log('PaymentController->handlePaymentResponse', error);
      res.redirect(
        `${getFrontendRoute().AcademicsFeesRoute}?status=${PaymentStatus.FAILED}`,
      );
    }
  }

  @Roles(Role.Service)
  @Post('ccavenue/webhook')
  async handleCCAvenuePaymentWebhook(@Body() body: any) {
    try {
      const payment = await this.paymentService.handleCCAvenuePaymentResponse(body);
      return new ResponseHelper(payment);
    } catch (error) {
      console.log('PaymentController->handleCCAvenuePaymentWebhook', error);
      throw error;
    }
  }

  // to run locally uncomment Public flag and comment Role.Service
  // @Public()
  @Roles(Role.Service)
  @Post('air-pay/response')
  async handleAirPayPayment(@Res() res: Response, @Body() body: any) {
    try {
      const payment = await this.paymentService.handleAirPayPaymentResponse(body);
      const status = PaymentStatus[payment.status];

      res.redirect(`${getFrontendRoute().AcademicsFeesRoute}?status=${status}`);
    } catch (error) {
      console.log('PaymentController->handleAirPayPayment', error);
      res.redirect(
        `${getFrontendRoute().AcademicsFeesRoute}?status=${PaymentStatus.FAILED}`,
      );
    }
  }

  @Roles(Role.Service)
  @Post('airpay/webhook')
  async handleAirpayPaymentWebhook(@Body() body: any) {
    try {
      const payment = await this.paymentService.handleAirPayPaymentResponse(body);
      return new ResponseHelper(payment);
    } catch (error) {
      console.log('PaymentController->handleAirpayPaymentWebhook', error);
      throw error;
    }
  }

  // to run locally uncomment Public flag and comment Role.Service
  // @Public()
  @Roles(Role.Service)
  @Post('air-pay/ipn-status')
  async handleAirPayIpnStatusPayment(@Res() res: Response, @Body() body: any) {
    try {
      await this.paymentService.handleAirPayPaymentResponse(body);
      return new ResponseHelper('Success');
    } catch (error) {
      console.log('PaymentController->handleAirPayIpnStatusPayment', error);
      throw error;
    }
  }

  @Roles(Role.Student)
  @Get('transactions')
  async getMyTransactions(@DefaultUser() user: DefaultUserResponse) {
    try {
      const { transactions, count } = await this.paymentService.getMyTransactions(user);

      return new ResponseHelper(transactions, count);
    } catch (error) {
      console.log('PaymentController->handleAirPayIpnStatusPayment', error);
      throw error;
    }
  }

  @Get('receipt')
  async getPaymentReceipt(
    @DefaultUser() user: DefaultUserResponse,
    @Query() paymentReceiptQueryDto: PaymentReceiptQueryDto,
  ) {
    try {
      const brand = await this.masterService.getBrandById(user.activeRole.brandId);
      if (getAptrack2BrandIdList().includes(brand.key)) {
        const payload =
          await this.paymentReceiptService.fetchPaymentReceiptPayload(
            paymentReceiptQueryDto,
          );
        return new ResponseHelper(payload);
      }
      throw new PermissionException(PermissionErrorMessagesEnum.ACCESS_DENIED);
    } catch (error) {
      console.log('payment->getPaymentReceipt', error);
      throw error;
    }
  }
}
