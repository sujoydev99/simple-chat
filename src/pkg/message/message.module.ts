import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Message } from '../../models/message.model';
import { Thread } from '../../models/thread.model';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';
import { DocumentModule } from '../document/document.module';
import { OpenAIModule } from '../shared/openai.module';

@Module({
    imports: [
        SequelizeModule.forFeature([Message, Thread]),
        DocumentModule,
        OpenAIModule,
    ],
    controllers: [MessageController],
    providers: [MessageService],
    exports: [MessageService],
})
export class MessageModule {} 