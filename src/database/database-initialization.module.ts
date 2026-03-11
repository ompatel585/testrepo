import { Module } from '@nestjs/common';
import { DatabaseInitService } from './database-init.service';
import { UserTableInitService } from './user-table-init.service';

@Module({
  providers: [DatabaseInitService, UserTableInitService],
})
export class DatabaseInitModule {}
