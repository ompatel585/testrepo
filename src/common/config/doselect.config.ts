import { registerAs } from '@nestjs/config';

export default registerAs('doSelect', () => ({
    apiBaseUrl: process.env.DOSELECT_API_BASE_URL || 'https://api.doselect.com/platform/v1/',
    emailDomain: process.env.DOSELECT_API_EMAIL_DOMAIN || 'onlinevarsity.com',
    apiKey: process.env.DOSELECT_API_KEY,
    apiSecret: process.env.DOSELECT_API_SECRET
}));
