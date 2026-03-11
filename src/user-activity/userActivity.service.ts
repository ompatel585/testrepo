import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';
import { UserActivity } from 'src/common/entities/userActivity.entity';

@Injectable()
export class UserActivityService {
  private readonly logger = new Logger(UserActivityService.name);

  constructor(
    @InjectRepository(UserActivity)
    private userActivityRepository: Repository<UserActivity>,
  ) {}

  async trackActivity(
    req: Request,
    userId: number,
    activityType: string,
  ): Promise<UserActivity> {
    try {
      const userAgent = req.headers['user-agent'] || '';

      const ip = this.extractIp(req);

      const deviceInfo = this.parseUserAgent(userAgent);

      const userActivity = this.userActivityRepository.create({
        userId,
        ip,
        userAgent,
        activityType,
        ...deviceInfo,
      });

      return await this.userActivityRepository.save(userActivity);
    } catch (error) {
      this.logger.error(`Failed to track user activity: ${error.message}`, error.stack);
      throw new Error(`Failed to track user activity: ${error.message}`);
    }
  }

  private extractIp(req: Request): string {
    try {
      // Try to get the client IP from various headers
      let ip =
        (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
        (req.headers['x-real-ip'] as string) ||
        (req.headers['x-client-ip'] as string) ||
        req.connection?.remoteAddress ||
        req.socket?.remoteAddress ||
        '';

      // Normalize the IP address
      if (ip) {
        // Convert IPv6 localhost to IPv4 for better readability
        if (ip === '::1' || ip === '::ffff:127.0.0.1') {
          ip = '127.0.0.1';
        }

        // Remove IPv6 prefix if present
        if (ip.startsWith('::ffff:')) {
          ip = ip.substring(7);
        }
      } else {
        ip = 'unknown';
      }

      return ip;
    } catch (error) {
      this.logger.warn(`Failed to extract IP: ${error.message}`);
      return 'unknown';
    }
  }

  private parseUserAgent(userAgent: string): {
    deviceType: string;
    deviceOs: string;
    browserName: string;
    browserVersion: string;
    appType: string;
  } {
    try {
      let deviceType = 'unknown';
      let deviceOs = 'unknown';
      let browserName = 'unknown';
      let browserVersion = 'unknown';
      let appType = 'unknown';

      // Device Type Detection
      if (/Mobile|Android|iPhone|iPad|iPod|Windows Phone/i.test(userAgent)) {
        if (/iPad|tablet/i.test(userAgent)) {
          deviceType = 'tablet';
        } else {
          deviceType = 'mobile';
        }
      } else {
        deviceType = 'computer';
      }

      // OS Detection
      if (/Windows NT/i.test(userAgent)) {
        deviceOs = 'Windows';
      } else if (/Macintosh|Mac OS X/i.test(userAgent)) {
        deviceOs = 'macOS';
      } else if (/Android/i.test(userAgent)) {
        deviceOs = 'Android';
      } else if (/iPhone|iPad|iPod/i.test(userAgent)) {
        deviceOs = 'iOS';
      } else if (/Linux/i.test(userAgent)) {
        deviceOs = 'Linux';
      }

      // Browser Detection
      if (/Chrome/i.test(userAgent) && !/Chromium|OPR|Edge/i.test(userAgent)) {
        browserName = 'Chrome';
        const match = userAgent.match(/Chrome\/(\d+\.\d+)/);
        if (match) browserVersion = match[1];
      } else if (/Firefox/i.test(userAgent)) {
        browserName = 'Firefox';
        const match = userAgent.match(/Firefox\/(\d+\.\d+)/);
        if (match) browserVersion = match[1];
      } else if (/Safari/i.test(userAgent) && !/Chrome|Chromium/i.test(userAgent)) {
        browserName = 'Safari';
        const match = userAgent.match(/Version\/(\d+\.\d+)/);
        if (match) browserVersion = match[1];
      } else if (/Edge/i.test(userAgent)) {
        browserName = 'Edge';
        const match = userAgent.match(/Edge\/(\d+\.\d+)/);
        if (match) browserVersion = match[1];
      } else if (/MSIE|Trident/i.test(userAgent)) {
        browserName = 'Internet Explorer';
        const match = userAgent.match(/(?:MSIE |rv:)(\d+\.\d+)/);
        if (match) browserVersion = match[1];
      }

      // App Type Detection
      // App Type Detection
      if (/Postman/i.test(userAgent)) {
        appType = 'postman';
      } else if (/ReactNative/i.test(userAgent)) {
        appType = 'reactNative';
      } else if (/Electron/i.test(userAgent)) {
        appType = 'electron';
      } else if (userAgent.includes('AndroidApp')) {
        appType = 'androidApp';
      } else if (userAgent.includes('iOSApp')) {
        appType = 'iosApp';
      } else if (/Instagram|FBAV|FBAN/i.test(userAgent)) {
        appType = 'inAppBrowser';
      } else if (/WhatsApp/i.test(userAgent)) {
        appType = 'whatsAppBrowser';
      } else if (/PWA|progressive web app/i.test(userAgent)) {
        appType = 'pwa';
      } else if (/Mobile|Android|iPhone|iPad|iPod/i.test(userAgent)) {
        if (deviceType === 'tablet') {
          appType = 'tabletBrowser';
        } else {
          appType = 'mobileBrowser';
        }
      } else {
        appType = 'webBrowser';
      }

      return {
        deviceType,
        deviceOs,
        browserName,
        browserVersion,
        appType,
      };
    } catch (error) {
      this.logger.warn(`Failed to parse user agent: ${error.message}`);
      return {
        deviceType: 'unknown',
        deviceOs: 'unknown',
        browserName: 'unknown',
        browserVersion: 'unknown',
        appType: 'unknown',
      };
    }
  }
}
