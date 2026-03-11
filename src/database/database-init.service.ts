import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { UserTableInitService } from './user-table-init.service';

@Injectable()
export class DatabaseInitService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseInitService.name);

  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
    private userTableInitService: UserTableInitService,
  ) {}

  async onModuleInit() {
    this.logger.log('Starting database initialization...');

    try {
      await this.initializeAll();
      this.logger.log('Database initialization completed successfully');
    } catch (error) {
      this.logger.error('Database initialization failed:', error.message);
      throw error;
    }
  }

  private async initializeAll(): Promise<void> {
    // Initialize all database tables
    const initTasks = [{ name: 'User Table', service: this.userTableInitService }];

    for (const task of initTasks) {
      try {
        this.logger.log(`Initializing ${task.name}...`);
        await task.service.initialize(this.dataSource);
        this.logger.log(`${task.name} initialization completed`);
      } catch (error) {
        this.logger.error(`${task.name} initialization failed:`, error.message);
        throw error;
      }
    }
  }
}
