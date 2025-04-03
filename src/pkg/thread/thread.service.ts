import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Thread } from '../../models/thread.model';
import { CreateThreadDto } from './dto/create-thread.dto';

@Injectable()
export class ThreadService {
  constructor(
    @InjectModel(Thread)
    private threadModel: typeof Thread,
  ) {}

  async create(userId: number, createThreadDto: CreateThreadDto) {
    return this.threadModel.create({
      ...createThreadDto,
      userId,
    });
  }

  async findAll(userId: number) {
    return this.threadModel.findAll({
      where: { userId },
      include: ['messages'],
    });
  }

  async findOne(id: number, userId: number) {
    return this.threadModel.findOne({
      where: { id, userId },
      include: ['messages'],
    });
  }
} 