import { registerAs } from '@nestjs/config';

export default registerAs('serverConfig', () => ({
  PORT: process.env.PORT || 3000,
  CLOUDWATCH_CREDENTIALS:
    process.env.ENV == 'local'
      ? {
          region: process.env.AWS_REGION,
          credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            sessionToken: process.env.AWS_SESSION_TOKEN,
          },
        }
      : { region: process.env.AWS_REGION },
  CLOUDWATCH_GROUP_NAME: process.env.CLOUDWATCH_GROUP_NAME || '/pro-connect/dev',
  CLOUDWATCH_STREAM_NAME: process.env.CLOUDWATCH_STREAM_NAME || '/pro-connect/dev',
  S3_CREDENTIALS:
    process.env.ENV == 'local'
      ? {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          sessionToken: process.env.AWS_SESSION_TOKEN,
          region: process.env.AWS_REGION,
        }
      : { region: process.env.AWS_REGION },

  APTRACK2_S3_CREDENTIALS: {
    accessKeyId: process.env.APTRACK2_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.APTRACK2_AWS_SECRET_ACCESS_KEY,
    sessionToken: process.env.APTRACK2_AWS_SESSION_TOKEN,
    region: process.env.APTRACK2_AWS_REGION,
  },

  ENCRYPT_PASSWORD: process.env.PASSWORD_ENCRYPTION_KEY ? true : false,
}));
