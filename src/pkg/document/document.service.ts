import { Injectable, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Document } from '../../models/document.model';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { OpenAI } from 'openai';
import { ConfigService } from '@nestjs/config';
import { WeaviateService } from './weaviate.service';
import { OpenAIService } from '../shared/openai.service';
import { TextLoader } from 'langchain/document_loaders/fs/text';
import { JSONLoader } from 'langchain/document_loaders/fs/json';
import { CSVLoader } from '@langchain/community/document_loaders/fs/csv';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { Document as LangChainDocument } from '@langchain/core/documents';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';

@Injectable()
export class DocumentService {
  private openai: OpenAI;

  constructor(
    private configService: ConfigService,
    private weaviateService: WeaviateService,
    @Inject(forwardRef(() => OpenAIService))
    private openAIService: OpenAIService,
    @InjectModel(Document)
    private documentModel: typeof Document,
  ) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
  }

  async uploadDocument(userId: number, uploadDocumentDto: UploadDocumentDto, file: Express.Multer.File) {
    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      throw new BadRequestException('File size exceeds 5MB limit');
    }

    // Check file type
    const allowedTypes = ['application/pdf', 'text/plain', 'text/csv', 'application/json'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Allowed types: PDF, TXT, CSV, JSON');
    }

    // Create document record
    const document = await this.documentModel.create({
      name: uploadDocumentDto.name,
      userId,
    });

    // Process document based on type using LangChain loaders
    let docs: any[] = [];
    console.log(new Blob([file.buffer], { type: file.mimetype }))
    switch (file.mimetype) {
      case 'application/pdf':
        const pdfLoader = new PDFLoader(new Blob([file.buffer], { type: file.mimetype }), {splitPages: false});
        docs = await pdfLoader.load();
        break;
      case 'text/plain':
        const textLoader = new TextLoader(new Blob([file.buffer], { type: file.mimetype }));
        docs = await textLoader.load();
        break;
      case 'text/csv':
        const csvLoader = new CSVLoader(new Blob([file.buffer], { type: file.mimetype }));
        docs = await csvLoader.load();
        break;
      case 'application/json':
        const jsonLoader = new JSONLoader(new Blob([file.buffer], { type: file.mimetype }));
        docs = await jsonLoader.load();
        break;
    }

    // Create Weaviate schema for user if it doesn't exist
    await this.weaviateService.createSchema(userId);

    // Process each document chunk
      const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 4000,
      chunkOverlap: 200
    });

    docs = await textSplitter.splitDocuments(docs);
    for (let i = 0; i < docs.length; i++) {
      const doc = docs[i];
      const embedding = await this.openAIService.generateEmbedding(doc.pageContent);
      
      // Store in Weaviate
      await this.weaviateService.addDocument(userId, {
        content: doc.pageContent,
        documentId: document.id,
        documentName: uploadDocumentDto.name,
        pageNo: doc.metadata?.page || 1,
        lineNo: i + 1,
        embedding,
      });
    }

    return document;
  }

  private splitIntoChunks(text: string, chunkSize: number = 1000): string[] {
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    const chunks: string[] = [];
    let currentChunk = '';

    for (const sentence of sentences) {
      if (currentChunk.length + sentence.length > chunkSize) {
        chunks.push(currentChunk.trim());
        currentChunk = sentence;
      } else {
        currentChunk += ' ' + sentence;
      }
    }

    if (currentChunk) {
      chunks.push(currentChunk.trim());
    }

    return chunks;
  }

  async getUserDocuments(userId: number) {
    return this.documentModel.findAll({
      where: { userId },
    });
  }

  async searchDocuments(userId: number, query: string) {
    return this.weaviateService.searchDocuments(userId, query);
  }

  async deleteDocument(userId: number, documentId: number) {
     await this.weaviateService.deleteByDocumentId(userId, documentId);
    return this.documentModel.destroy({
      where: { id: documentId, userId },
    });
  }
} 