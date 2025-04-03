import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ThreadService } from './thread.service';
import { CreateThreadDto } from './dto/create-thread.dto';
import { AuthMiddleware } from '../../middleware/auth.middleware';

@ApiTags('threads')
@Controller('threads')
@UseGuards(AuthMiddleware)
@ApiBearerAuth()
export class ThreadController {
  constructor(private readonly threadService: ThreadService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new thread' })
  @ApiResponse({ status: 201, description: 'Thread successfully created' })
  async create(@Body() createThreadDto: CreateThreadDto, @Req() req) {
    return this.threadService.create(req.user.id, createThreadDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all threads for the current user' })
  @ApiResponse({ status: 200, description: 'Returns all threads' })
  async findAll(@Req() req) {
    return this.threadService.findAll(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific thread' })
  @ApiResponse({ status: 200, description: 'Returns the thread' })
  async findOne(@Param('id') id: string, @Req() req) {
    return this.threadService.findOne(+id, req.user.id);
  }
} 