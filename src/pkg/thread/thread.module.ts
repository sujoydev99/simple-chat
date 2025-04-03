import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Thread } from '../../models/thread.model';
import { ThreadController } from './thread.controller';
import { ThreadService } from './thread.service';

@Module({
  imports: [
    SequelizeModule.forFeature([Thread])
  ],
  controllers: [ThreadController],
  providers: [ThreadService],
  exports: [ThreadService],
})
export class ThreadModule {} 