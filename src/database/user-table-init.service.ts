import { Injectable, Logger } from '@nestjs/common';
import { DataSource, QueryRunner } from 'typeorm';

@Injectable()
export class UserTableInitService {
  private readonly logger = new Logger(UserTableInitService.name);

  async initialize(dataSource: DataSource): Promise<void> {
    const queryRunner = dataSource.createQueryRunner();

    try {
      await queryRunner.connect();

      // Creating case-insensitive unique index for userId
      await this.createUserIdIndex(queryRunner);
    } catch (error) {
      this.logger.error('Error during user table initialization:', error.message);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async createUserIdIndex(queryRunner: QueryRunner): Promise<void> {
    try {
      // Check if index already exists
      const indexExists = await queryRunner.query(`
        SELECT 1 FROM pg_indexes 
        WHERE schemaname = 'public' 
        AND tablename = 'user' 
        AND indexname = 'idx_user_userid_lower'
      `);

      if (indexExists.length === 0) {
        this.logger.log('Creating case-insensitive unique index for userId...');

        await queryRunner.query(`
          CREATE UNIQUE INDEX "idx_user_userid_lower" 
          ON "user" (LOWER("userId"))
        `);

        this.logger.log('Successfully created case-insensitive index for userId');
      } else {
        this.logger.log('Case-insensitive index for userId already exists');
      }
    } catch (error) {
      // Handle the case where duplicates already exist
      // 23505 occurs when a unique constraint is violated
      if (error.code === '23505' || error.message.includes('duplicated')) {
        this.logger.error(
          'Cannot create userId index: Duplicate case-insensitive userIds found',
        );

        // to fetch records
        this.logger.error(`
          SELECT 
            LOWER("userId") AS lowered_userId,
            ARRAY_AGG("id") AS conflictingIds,
            ARRAY_AGG("userId") AS conflictingUserIds,
            COUNT(*) AS conflictCount
          FROM "user"
          GROUP BY LOWER("userId")
          HAVING COUNT(*) > 1;
        `);

        // to update min id records
        this.logger.error(`
          UPDATE "user"
          SET "userId" = CONCAT('dummy', '-', "userId")
          WHERE id IN (
              SELECT MIN(id)
              FROM "user"
              GROUP BY LOWER("userId")
            having count(*) > 1
          );
        `);
      } else {
        this.logger.error('Error creating userId index:', error.message);
      }
      throw error;
    }
  }
}
