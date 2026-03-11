import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import CryptoJS from 'crypto-js';

@Injectable()
export class CryptoServiceUtil {
  private getAlgorithm(keyBase64) {
    var key = Buffer.from(keyBase64, 'base64');
    switch (key.length) {
      case 16:
        return 'aes-128-cbc';
      case 32:
        return 'aes-256-cbc';
    }
    throw new Error('Invalid key length: ' + key.length);
  }

  private getKeyBase64(workingKey) {
    const md5 = crypto.createHash('md5').update(workingKey).digest();

    return Buffer.from(md5).toString('base64');
  }

  private getIvBase64() {
    return Buffer.from([
      0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b, 0x0c, 0x0d,
      0x0e, 0x0f,
    ]).toString('base64');
  }

  encrypt(plainText, workingKey): string {
    const keyBase64 = this.getKeyBase64(workingKey);
    const ivBase64 = this.getIvBase64();
    const key = Buffer.from(keyBase64, 'base64');
    const iv = Buffer.from(ivBase64, 'base64');

    const cipher = crypto.createCipheriv(this.getAlgorithm(keyBase64), key, iv);
    let encrypted = cipher.update(plainText, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  decrypt(encryptText, workingKey) {
    const keyBase64 = this.getKeyBase64(workingKey);
    const ivBase64 = this.getIvBase64();
    const key = Buffer.from(keyBase64, 'base64');
    const iv = Buffer.from(ivBase64, 'base64');

    const decipher = crypto.createDecipheriv(this.getAlgorithm(keyBase64), key, iv);
    let decrypted = Buffer.concat([
      decipher.update(Buffer.from(encryptText, 'hex')),
      decipher.final(),
    ]);
    return decrypted.toString();
  }
  getKey(passphrase) {
    return CryptoJS.SHA256(passphrase); // Ensures a 32-byte key
  }

  decryptUsingCryptoJS(encryptText, workingKey) {
    try {
      const key = this.getKey(workingKey); // 32-byte key
      const encryptedText = encryptText;

      const [ivBase64, encryptedBase64] = encryptedText.split(':');
      const iv = CryptoJS.enc.Base64.parse(ivBase64);

      const decrypted = CryptoJS.AES.decrypt(encryptedBase64, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      });
      return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      return null;
    }
  }

  sha256(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }
}
