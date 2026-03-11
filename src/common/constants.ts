// numbers
export const HUNDRED = 100;
export const FIFTY = 50;
export const SIXTY = 60;

// time constants
export const ONE_MINUTE_IN_MILL_SEC = 1 * 60000;
export const ONE_DAY_IN_MILL_SEC = 24 * 60 * ONE_MINUTE_IN_MILL_SEC;
// config constants
export const APP_VERSION = '1.0.0';
export const PASSWORD_HASH_SALT: number = 10;
export const DEFAULT_COOKIE_EXPIRES_IN_MILLISECOND = SIXTY * ONE_MINUTE_IN_MILL_SEC;
export const DEFAULT_REFRESH_TOKEN_COOKIE_EXPIRES_IN_MILLISECOND =
  7 * ONE_DAY_IN_MILL_SEC;
export const OTP_EXPIRES_IN = '5m';
export const BOT_TOKEN_EXPIRES_IN = '2h';

export const SALT_ROUNDS = 10;
export const FROM_EMAIL_ID = 'donotreply@aptech.ac.in';
export const ENVIRONMENT = {
  DEVELOPMENT: 'development',
  PRODUCTION: 'production',
  TEST: 'test',
};
// S3 Folders
export const S3_COVER = 'cover';
export const S3_PROFILE = 'profile';
export const S3_WORK = 'work';
export const S3_PORTFOLIO = 'portfolio';
export const S3_JOB = 'job';
export const S3_DOCUMENT = 'document';
export const S3_MODULE = 'module';
export const S3_PLACEMENT_ASSISTANT = 'placement-assistant';
export const MAX_JOB_APPLICATION = 3;

export const S3_COMPANY = 'company';
export const S3_LEARNING_CIRCLE = 'learning-circle';
export const S3_DIGITAL_LEARNING_CERTIFICATES = 'digital_learning_certificates';
export const S3_BC_RECEIPT = 'bc_receipt';
export const S3_BOOK = 'book';
export const S3_BOOK_UPLOAD_DIR = 'upload';
export const S3_DRM_BOOKS = 'drm-books';

export const S3_COURSE = 'course';
export const S3_TERM = 'term';
export const S3_Event = 'event';

// S3 Sub-Folders
export const S3_WORK_THUMBNAIL = 'thumbnail';

// CAPTCHA
export const RECAPTCHA_VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify';

// image compression
export const imageCompressionContext = {
  work: 'work',
} as const;

export const imageCompressionTypes = { view: 'view', thumbnail: 'thumbnail' };

// Front End Routes
export const getFrontendRoute = () => ({
  AcademicsFeesRoute: `${process.env.FRONTEND_URL}/digital-learning/academics/fees`,
});

// SQS Poll delay time in ms
export const SQS_POLL_ERROR_DELAY = 60 * ONE_MINUTE_IN_MILL_SEC; // 1 hr poll delay

// APPLICATION NAME
export const APPLICATION_NAME = 'PROCONNECT';

// Proconnect Domain
export const PROCONNECT_DOMAIN = 'aptechproconnect.com';

// BC-Receipt encryption base64 keys
export const TRIPLE_DES_KEY_BASE64 = 'TRIPLE_DES_KEY_BASE64';
export const TRIPLE_DES_IV_BASE64 = 'TRIPLE_DES_IV_BASE64';

export const PROCONNECT_SUPPORT_EMAIL = 'support@aptechproconnect.com';

//Aptrack2.0 brands
export function getAptrack2BrandIdList(): number[] {
  const brandListString = process.env.APTRACK_2_BRAND_ID_LIST_STRING;

  if (!brandListString) return [];

  return brandListString
    .split(',')
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => !isNaN(n));
}

// BRAND
export const UNIVERSITY_BRAND_ID = [22, 23, 24, 25, 26];
