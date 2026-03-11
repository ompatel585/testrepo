import { registerAs } from '@nestjs/config';

export const determineEnvSettings = () => {
  const nodeEnv = process.env.NODE_ENV?.trim() || 'local';

  return {
    nodeEnv,
    ignoreEnvFile: nodeEnv === 'docker',
    envFilePath: ['.env.local', '.env.dev', '.env.uat', '.env'],
    // envFilePath: ['.env.dev'],
  };
};

export default registerAs('envConfig', determineEnvSettings);
