import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { OpenAIService } from './openai.service';
import { DocumentModule } from '../document/document.module';

@Module({
  imports: [
    ConfigModule,
    forwardRef(() => DocumentModule),
  ],
  providers: [OpenAIService],
  exports: [OpenAIService],
})
export class OpenAIModule {} 