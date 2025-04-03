import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OpenAI } from 'openai';
import { Message } from '../../models/message.model';
import { DocumentService } from '../document/document.service';

type MessageType = {
    role: 'user' | 'assistant' | 'system' | 'tool';
    content: string;
    tool_call_id?: string;
    tool_calls?: any;
};

@Injectable()
export class OpenAIService {
    private openai: OpenAI;

    constructor(
        private configService: ConfigService,
        @Inject(forwardRef(() => DocumentService))
        private documentService: DocumentService,
    ) {
        this.openai = new OpenAI({
            apiKey: this.configService.get<string>('OPENAI_API_KEY'),
        });
    }

    async generateCompletion(messages: MessageType[], userId: number, threadId: number) {
        // Format messages for OpenAI\c
        const rawData: {documentName: string, content: string}[] = []
        const formattedMessages = messages.map(msg => ({
            role: msg.role,
            content: msg.content,
            ...(msg.tool_call_id && { tool_call_id: msg.tool_call_id }),
            ...(msg.tool_calls && { tool_calls: msg.tool_calls }),
        }));
        formattedMessages.unshift({
            role: 'system',
            content: `
            Context: Your name is Rager.
            Your task is to understand the user query and provide the most relevant answer from the documents.
            You can use the search_documents tool to search for documents in the database.
            Rules:
            - You must use the search_documents tool to search for documents in the database.
            - You must provide the most relevant answer from the documents.
            - You must use the context to provide the most relevant answer.
            `,
        })

        try {

        while (true){
            const completion = await this.openai.chat.completions.create({
                model: 'gpt-4-turbo-preview',
                messages: formattedMessages as any,
                temperature: 0.7,
                max_tokens: 1000,
                tools: [
                    {
                        type: 'function',
                        function: {
                            name: 'search_documents',
                            description: 'Search for documents in the database',
                            parameters: {
                                type: 'object',
                                properties: {
                                    query: {
                                        type: 'string',
                                        description: 'Refined, verbose search query',
                                    },
                                },
                            }
                        }
                    }
                ],
                tool_choice: 'auto',
            });

            const { message: response, finish_reason: finishReason } = completion.choices[0];
            
            // Handle tool calls if present
            if (response.tool_calls?.length) {
                formattedMessages.push({
                    role: 'assistant',
                    tool_calls: response.tool_calls as any,
                    content: response.content || ''
                  })
                for (const toolCall of response.tool_calls) {
                    if (toolCall.function.name === 'search_documents' && userId) {
                        const args = JSON.parse(toolCall.function.arguments);
                        const searchResults = await this.documentService.searchDocuments(userId, args.query);
                        
                        // Add search results to the conversation
                        formattedMessages.push({
                            role: 'tool',
                            tool_call_id: toolCall.id,
                            content: `I found these relevant documents:\n${searchResults.map(result => 
                                `From "${result.documentName}":\n${result.content}\n`
                            ).join('\n')}`,
                        });
                        rawData.push(searchResults.map(result => ({
                            documentName: result.documentName,
                            content: result.content,
                            documentId: result.documentId
                        })));
                    }
                }
            }
            if (finishReason === 'stop') {
                return {content: response.content, rawData: rawData};
            }

        }

        } catch (error) {
            console.error('Error generating completion:', error);
            throw error;
        }
    }

    async generateEmbedding(text: string): Promise<number[]> {
        try {
            const response = await this.openai.embeddings.create({
                model: 'text-embedding-3-small',
                input: text,
            });

            return response.data[0].embedding;
        } catch (error) {
            console.error('Error generating embedding:', error);
            throw error;
        }
    }
} 