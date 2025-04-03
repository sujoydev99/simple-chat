import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Message } from '../../models/message.model';
import { Thread } from '../../models/thread.model';
import { CreateMessageDto } from './dto/create-message.dto';
import { OpenAIService } from '../shared/openai.service';
import { DocumentService } from '../document/document.service';

@Injectable()
export class MessageService {
  constructor(
    @InjectModel(Message)
    private messageModel: typeof Message,
    @InjectModel(Thread)
    private threadModel: typeof Thread,
    private openAIService: OpenAIService,
    private documentService: DocumentService,
  ) {}

  async create(userId: number, createMessageDto: CreateMessageDto) {
    let threadId = createMessageDto.threadId;

    // Create new thread if threadId is not provided
    //check if threadId is provided and belongs to the user
    if (threadId) {
      const thread = await this.threadModel.findOne({
        where: { id: threadId, userId },
      });
      if (!thread) {
        throw new NotFoundException(`Thread with ID ${threadId} not found for user ${userId}`);
      }
    }
    else{
      const thread = await this.threadModel.create({
        title: createMessageDto.content.slice(0, 50) + (createMessageDto.content.length > 50 ? '...' : ''),
        userId,
      });
      threadId = thread.id
    }

    // Create user message
    const userMessage = await this.messageModel.create({
      ...createMessageDto,
      threadId,
      userId,
      role: 'user',
    });

    // Get thread messages for context
    const threadMessages = await this.messageModel.findAll({
      where: { threadId},
      order: [['createdAt', 'ASC']],
    });

    // Generate completion with context
    const {content, rawData} = await this.openAIService.generateCompletion(threadMessages, userId, threadId);

    // Create assistant message
    const assistantMessage = await this.messageModel.create({
      content: content,
      rawData: rawData,
      threadId,
      userId,
      role: 'assistant',
    });

    return assistantMessage;
  }

  async findAll(threadId: number | null, userId: number, page: number = 1, limit: number = 10) {
    const where: any = { userId };
    if (threadId) {
      where.threadId = threadId;
    }
    
    return this.messageModel.findAll({
      where,
      order: [['createdAt', 'ASC']],
      offset: (page - 1) * limit,
      limit: limit,
    });
  }


} 