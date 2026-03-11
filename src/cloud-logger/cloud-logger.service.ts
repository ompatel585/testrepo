import { Injectable } from '@nestjs/common';
import {
  CloudWatchLogsClient,
  PutLogEventsCommand,
  CreateLogStreamCommand,
  DescribeLogStreamsCommand,
  DescribeLogGroupsCommand,
  CreateLogGroupCommand,
} from '@aws-sdk/client-cloudwatch-logs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CloudLoggerService {
  private cloudWatchClient: CloudWatchLogsClient;
  private logGroupName: string;
  private logStreamName: string;
  private sequenceToken = undefined;

  constructor(private configService: ConfigService) {
    this.cloudWatchClient = new CloudWatchLogsClient(
      this.configService.get('serverConfig').CLOUDWATCH_CREDENTIALS,
    );

    this.logGroupName = this.configService.get('serverConfig').CLOUDWATCH_GROUP_NAME;
    this.logStreamName = this.configService.get('serverConfig').CLOUDWATCH_STREAM_NAME;

    this.setupLogStream();
  }

  private async setupLogStream() {
    // Check if the log stream exists, and if not, create it.
    try {
      // Check if the log group exists
      const logGroupExists = await this.checkLogGroupExists(this.logGroupName);
      if (!logGroupExists) {
        console.log(`Log group "${this.logGroupName}" does not exist. Creating...`);
        // Create the log group if it doesn't exist
        await this.createLogGroup(this.logGroupName);
      }

      const describeLogStreamsCommand = new DescribeLogStreamsCommand({
        logGroupName: this.logGroupName,
        logStreamNamePrefix: this.logStreamName,
      });

      const logStreams = await this.cloudWatchClient.send(describeLogStreamsCommand);

      if (logStreams.logStreams && logStreams.logStreams.length > 0) {
        this.sequenceToken = logStreams.logStreams[0].uploadSequenceToken;
      } else {
        // Create the log stream if it doesn't exist
        const createLogStreamCommand = new CreateLogStreamCommand({
          logGroupName: this.logGroupName,
          logStreamName: this.logStreamName,
        });
        await this.cloudWatchClient.send(createLogStreamCommand);
      }
    } catch (error) {
      if (error.__type == 'ResourceNotFoundException') {
        return;
      }
      console.error('Error setting up CloudWatch log stream:', error, error.__type);
    }
  }

  private async checkLogGroupExists(logGroupName: string): Promise<boolean> {
    const describeLogGroupsCommand = new DescribeLogGroupsCommand({
      logGroupNamePrefix: logGroupName,
    });

    const response = await this.cloudWatchClient.send(describeLogGroupsCommand);
    return (
      response.logGroups?.some((group) => group.logGroupName === logGroupName) ?? false
    );
  }

  private async createLogGroup(logGroupName: string): Promise<void> {
    const createLogGroupCommand = new CreateLogGroupCommand({
      logGroupName,
    });

    await this.cloudWatchClient.send(createLogGroupCommand);
    console.log(`Log group "${logGroupName}" created.`);
  }

  private async sendLogToCloudWatch(
    message: string,
    level: string,
    sendEmail: number = 0,
  ) {
    const timestamp = new Date().getTime();
    const messageJson = {
      message: `[${level.toUpperCase()}] ${message}`,
      sendEmail,
    };
    const logEvent = {
      message: JSON.stringify(messageJson),
      timestamp,
    };

    const putLogEventsCommand = new PutLogEventsCommand({
      logEvents: [logEvent],
      logGroupName: this.logGroupName,
      logStreamName: this.logStreamName,
      sequenceToken: this.sequenceToken,
    });

    try {
      const response = await this.cloudWatchClient.send(putLogEventsCommand);
      this.sequenceToken = response.nextSequenceToken; // Update the sequence token after each log
    } catch (error) {
      console.error('Error sending log to CloudWatch:', error);
    }
  }

  log(message: string) {
    this.sendLogToCloudWatch(message, 'info');
  }

  async error(message: string, trace?: string, sendEmail: number = 0) {
    this.sendLogToCloudWatch(`${message} - Trace: ${trace}`, 'error', sendEmail);
  }

  warn(message: string) {
    this.sendLogToCloudWatch(message, 'warn');
  }

  debug(message: string) {
    this.sendLogToCloudWatch(message, 'debug');
  }

  verbose(message: string) {
    this.sendLogToCloudWatch(message, 'verbose');
  }
}
