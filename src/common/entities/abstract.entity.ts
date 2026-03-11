import { ApiProperty } from '@nestjs/swagger';
import { PrimaryGeneratedColumn } from 'typeorm';

export class AbstractEntity<T> {
  @ApiProperty({ example: 1, description: 'primary id' })
  @PrimaryGeneratedColumn()
  id: number;

  constructor(entity: Partial<T>) {
    Object.assign(this, entity);
  }
}
