import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [`${__dirname}/../**/*.entity{.ts,.js}`],
  synchronize: true,
  ssl:
    !process.env.DB_SSL || process.env.DB_SSL === 'true'
      ? {
          rejectUnauthorized: false,
        }
      : false,
  // logging: ['query'], // Enable query logging
}));
