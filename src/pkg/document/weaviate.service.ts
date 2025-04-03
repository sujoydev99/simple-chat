import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import weaviate, { WeaviateClient, ObjectsBatcher } from 'weaviate-ts-client';
import { OpenAIService } from '../shared/openai.service';

@Injectable()
export class WeaviateService {
  private client: WeaviateClient;

  constructor(private configService: ConfigService, private openAIService: OpenAIService) {
    this.client = weaviate.client({
      scheme: 'http',
      host: '0.0.0.0:8080',
    });
  }

  async createSchema(userId: number) {
    const className = `Document_${userId}`;
    
    try {
      await this.client.schema
        .classCreator()
        .withClass({
          class: className,
          description: `Document embeddings for user ${userId}`,
          vectorizer: 'none',
          properties: [
            {
              name: 'content',
              dataType: ['text'],
            },
            {
              name: 'threadId',
              dataType: ['int'],
            },
            {
              name: 'documentId',
              dataType: ['int'],
            },
            {
              name: 'documentName',
              dataType: ['string'],
            },
            {
              name: 'pageNo',
              dataType: ['int'],
            },
            {
              name: 'lineNo',
              dataType: ['int'],
            },
          ],
        })
        .do();
    } catch (error) {
      // Schema might already exist, which is fine
      console.log(`Schema ${className} might already exist:`, error.message);
    }
  }

  async addDocument(userId: number, document: {
    content: string;
    documentId: number;
    documentName: string;
    pageNo: number;
    lineNo: number;
    embedding: number[];
  }) {
    const className = `Document_${userId}`;
    
    const batcher: ObjectsBatcher = this.client.batch.objectsBatcher();
    
    batcher.withObject({
      class: className,
      properties: {
        content: document.content,
        documentId: document.documentId,
        documentName: document.documentName,
        pageNo: document.pageNo,
        lineNo: document.lineNo,
      },
      vector: document.embedding,
    });

    await batcher.do();
  }

  async searchDocuments(userId: number, query: string, limit: number = 5) {
    const className = `Document_${userId}`;
    
    // Generate embedding for the query
    const queryEmbedding = await this.openAIService.generateEmbedding(query);
    
    let queryBuilder = this.client.graphql
      .get()
      .withClassName(className)
      .withFields('content documentId documentName pageNo lineNo')
      .withNearVector({ vector: queryEmbedding })
      .withLimit(limit);

    const result = await queryBuilder.do().catch(err => {
      console.error('Error searching documents in', err);
      throw err;
    });

    return result.data.Get[className];
  }

  async deleteByDocumentId(userId: number, documentId: number) {
    const className = `Document_${userId}`;
    
    try {
      // First get all objects with the given documentId
      const result = await this.client.graphql
        .get()
        .withClassName(className)
        .withFields('_additional { id }')
        .withWhere({
          operator: 'Equal',
          path: ['documentId'],
          valueInt: documentId
        })
        .do();

      // Delete each object by its ID
      const objects = result.data.Get[className];
      for (const obj of objects) {
        await this.client.data
          .deleter()
          .withClassName(className)
          .withId(obj._additional.id)
          .do();
      }
    } catch (error) {
      console.error(`Error deleting documents for documentId ${documentId}:`, error);
      throw error;
    }
  }
} 