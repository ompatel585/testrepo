import * as crypto from 'crypto';
import moment from 'moment';
import * as constant from '../../common/constants';

interface Payload {
  XAuthKey: string;
  BrandId: number;
  InvoiceId: number;
  StudentId: string;
  Timestamp?: string;
}

function tripleDESEncryptCSharpCompatible(plainText: string): string {
  const keyBase64 = process.env.TRIPLE_DES_KEY_BASE64 || constant.TRIPLE_DES_KEY_BASE64;
  const ivBase64 = process.env.TRIPLE_DES_IV_BASE64 || constant.TRIPLE_DES_IV_BASE64;

  const key = Buffer.from(keyBase64, 'base64'); // 24 bytes
  const iv = Buffer.from(ivBase64, 'base64'); // 8 bytes

  const cipher = crypto.createCipheriv('des-ede3-cbc', key, iv);
  cipher.setAutoPadding(true); // PKCS7

  let encrypted = cipher.update(plainText, 'ascii', 'base64');
  encrypted += cipher.final('base64');
  return encrypted;
}

function buildPayload({ brandKey, invoiceId, userId }): Payload {
  return {
    XAuthKey: process.env.APTRACK_ONE_TOKEN,
    BrandId: brandKey,
    InvoiceId: invoiceId,
    StudentId: userId,
    Timestamp: moment().format('DD-MMM-YYYY HH:mm:ss'), // e.g. 02-Jul-2025 14:22:38
  };
}

export function encryptBcReceiptPayload({ brandKey, invoiceId, userId }) {
  const payload = buildPayload({ brandKey, invoiceId, userId });
  const payloadJSONString = JSON.stringify(payload);
  const BCReceiptToken = tripleDESEncryptCSharpCompatible(payloadJSONString);
  return BCReceiptToken;
}
