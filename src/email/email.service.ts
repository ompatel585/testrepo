import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
// import * as sgMail from '@sendgrid/mail';
import sgMail from '@sendgrid/mail';

import { CloudLoggerService } from 'src/cloud-logger/cloud-logger.service';

@Injectable()
export class EmailService {
  private readonly logger = new Logger('EmailService');
  private readonly sendGridApiKey: string;

  constructor(private cloudLoggerService: CloudLoggerService) {
    this.sendGridApiKey = process.env.SENDGRID_API_KEY;
    sgMail.setApiKey(this.sendGridApiKey);
  }

  async sendEmail(msg: sgMail.MailDataRequired): Promise<[sgMail.ClientResponse, {}]> {
    try {
      if (process.env.DEVELOPMENT_EMAIL_TO) {
        msg.to = process.env.DEVELOPMENT_EMAIL_TO;
      }
      const response = await sgMail.send(msg);
      return response;
    } catch (error) {
      this.logger.error('Failed to send email', error);
      this.cloudLoggerService.error('Failed to send email', error.stack);
    }
  }
}
