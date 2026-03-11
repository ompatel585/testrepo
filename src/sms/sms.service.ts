import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import * as sgMail from '@sendgrid/mail';
import axios from 'axios';

export type MessageTemplateType = {
  templateMessage: string;
  templateId: string;
};

@Injectable()
export class SMSService {
  private readonly logger = new Logger('SMSService');

  /**
   * Sends an OTP message using the specified SMS API endpoint.
   * @property feedid The account identifier or feed identifier used for authentication or tracking purposes.
   * @property username Username used for authentication with the SMS service provider.
   * @property password Password used for authentication with the SMS service provider.
   * @property to The recipient's mobile number where the OTP message is to be sent.
   * @property message The content of the OTP message.
   * @property templateId Identifier for the SMS template used for sending OTP messages (optional).
   * @property entityId Identifier for the entity associated with the message (optional).
   * @property async Flag indicating whether to send the message asynchronously (true for asynchronous, false otherwise).
   * @returns an object with status and statusText
   */
  async sendSMS(
    templateData: MessageTemplateType,
    mobile: string,
  ): Promise<{ status: number; statusText: string }> {
    const requestBody = new URLSearchParams();
    requestBody.append('feedid', process.env.NET_CORE_SMS_FEED_ID);
    requestBody.append('username', process.env.NET_CORE_SMS_USERNAME);
    requestBody.append('password', process.env.NET_CORE_SMS_PASSWORD);
    requestBody.append('templateid', templateData.templateId);
    requestBody.append(
      'To',
      process.env.DEVELOPMENT_MOBILE_NUMBER
        ? process.env.DEVELOPMENT_MOBILE_NUMBER
        : mobile,
    );
    requestBody.append('Text', templateData.templateMessage);

    const response = await axios.post(
      process.env.NET_CORE_SMS_ENDPOINT,
      requestBody.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );
    if (response.data.includes('<ERROR>')) {
      this.logger.log('Failed to send Sms', response.data);
    }
    this.logger.log('SMS Response', response.data);
    return response;
  }
}
