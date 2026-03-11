import { Module, Global, OnApplicationShutdown, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Global()
@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const redisConfig = config.get('redisConfig');
        const client = new Redis({
          host: redisConfig.host,
          port: redisConfig.port,
          password: redisConfig.password,
          db: redisConfig.db,
          retryStrategy: (times) => {
            if (!redisConfig.required) {
              // In dev, retry max 5 times then continue
              if (times >= 5) return null;
              return Math.min(times * 100, 2000);
            } else {
              // In prod, fail immediately if cannot connect
              return 0; // no retry
            }
          },
        });

        client.on('error', (err) => {
          console.error('Redis error', err);
        });

        client.on('ready', () => {
          console.log(
            `✅ Redis connected successfully to ${redisConfig.host}:${redisConfig.port}`,
          );
        });

        return client;
      },
    },
  ],
  exports: ['REDIS_CLIENT'],
})
export class RedisModule {}
