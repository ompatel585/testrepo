import {
  Injectable,
  OnApplicationBootstrap,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import {
  SQSClient,
  ReceiveMessageCommand,
  DeleteMessageCommand,
  Message,
} from '@aws-sdk/client-sqs';
import { ConfigService } from '@nestjs/config';
import { SQS_POLL_ERROR_DELAY } from 'src/common/constants';
import { PaymentService } from 'src/payment/payment.service';
import { CloudLoggerService } from 'src/cloud-logger/cloud-logger.service';
import { PaymentGatewayEnum } from 'src/common/entities/payment-gateway.entity';

@Injectable()
export class SqsConsumerService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SqsConsumerService.name);
  private readonly sqsClient: SQSClient;
  private readonly queueUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly paymentService: PaymentService,
    private cloudLoggerService: CloudLoggerService,
  ) {
    const credentials = this.configService.get('serverConfig').S3_CREDENTIALS;
    this.queueUrl = process.env.SQS_WEBHOOK_QUEUE_URL || null;
    this.sqsClient = new SQSClient(credentials);
  }

  onApplicationBootstrap() {
    if (!this.queueUrl) {
      this.logger.error('SQS queue URL not configured. Skipping SQS polling.');
      return;
    }

    this.logger.log('Starting SQS polling loop after app bootstrap...');
    this.startPolling();
  }

  private async startPolling() {
    const poll = async () => {
      try {
        const command = new ReceiveMessageCommand({
          QueueUrl: this.queueUrl,
          MaxNumberOfMessages: 10,
          WaitTimeSeconds: 20,
        });

        const response = await this.sqsClient.send(command);
        const messages = response.Messages;

        if (messages) {
          for (const message of messages) {
            await this.handleMessage(message);
          }
        }
        setImmediate(poll);
      } catch (error) {
        this.cloudLoggerService.error(`Error polling messages from SQS: ${error}`);
        this.logger.error('Error polling messages from SQS', error);
        setTimeout(poll, SQS_POLL_ERROR_DELAY);
      }
    };

    poll();
  }

  private async handleMessage(message: Message) {
    try {
      const data = JSON.parse(message.Body);
      const payload = data?.payload;
      const pgSource = payload?.pgSource;

      if (pgSource && payload && Object.keys(payload).length > 0) {
        if (pgSource == PaymentGatewayEnum.CCAvenue) {
          await this.paymentService.handleCCAvenuePaymentResponse(payload);
        } else if (pgSource == PaymentGatewayEnum.AirPay) {
          await this.paymentService.handleAirPayPaymentResponse(payload);
        } else if (pgSource == 'hdfc') {
          // await this.paymentService.handleHDFCPaymentResponse(payload);
        } else {
          this.cloudLoggerService.error(`Unknown pgSource in payload: ${payload}`);
          throw new BadRequestException('payload missing pgSource!');
        }
      }

      await this.sqsClient.send(
        new DeleteMessageCommand({
          QueueUrl: this.queueUrl,
          ReceiptHandle: message.ReceiptHandle,
        }),
      );
    } catch (error) {
      this.logger.error('Failed to process or delete SQS message', error);
      this.cloudLoggerService.error(
        `Failed to process or delete SQS message: error: ${error.toString()}`,
      );
    }
  }
}
