import { Controller, Get, Post, Body, Param, UseGuards, Req, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { AuthMiddleware } from '../../middleware/auth.middleware';

@ApiTags('messages')
@Controller('messages')
@UseGuards(AuthMiddleware)
@ApiBearerAuth()
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new message' })
  @ApiResponse({ status: 201, description: 'Message successfully created' })
  async create(@Body() createMessageDto: CreateMessageDto, @Req() req) {
    return this.messageService.create(req.user.id, createMessageDto).catch(err => {
      console.error('Error creating message', err);
      throw err;
    });
  }

  @Get('/:threadId')
  @ApiOperation({ summary: 'Get all messages for a thread' })
  @ApiResponse({ status: 200, description: 'Returns all messages' })
  async findAll(@Param('threadId') threadId: string, @Req() req, @Query('page') page: number = 1, @Query('limit') limit: number = 10) {
    return this.messageService.findAll(+threadId, req.user.id, page, limit);
  }

} 