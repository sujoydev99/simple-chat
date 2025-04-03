import { Module, forwardRef } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Document } from '../../models/document.model';
import { DocumentController } from './document.controller';
import { DocumentService } from './document.service';
import { WeaviateService } from './weaviate.service';
import { OpenAIModule } from '../shared/openai.module';

@Module({
  imports: [
    SequelizeModule.forFeature([Document]),
    forwardRef(() => OpenAIModule),
  ],
  controllers: [DocumentController],
  providers: [DocumentService, WeaviateService],
  exports: [DocumentService],
})
export class DocumentModule {} 