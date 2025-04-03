import { Controller, Post, Get, Body, UseInterceptors, UploadedFile, UseGuards, Req, Query, Param, Delete } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DocumentService } from './document.service';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { AuthMiddleware } from '../../middleware/auth.middleware';

@ApiTags('documents')
@Controller('documents')
@UseGuards(AuthMiddleware)
@ApiBearerAuth()
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Post('')
  @ApiOperation({ summary: 'Upload a document' })
  @ApiResponse({ status: 201, description: 'Document successfully uploaded' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(
    @Body() uploadDocumentDto: UploadDocumentDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req,
  ) {
    return this.documentService.uploadDocument(req.user.id, uploadDocumentDto, file);
  }

  @Get()
  @ApiOperation({ summary: 'Get user documents' })
  @ApiResponse({ status: 200, description: 'Returns user documents' })
  async getUserDocuments(@Req() req) {
    return this.documentService.getUserDocuments(req.user.id);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search documents' })
  @ApiResponse({ status: 200, description: 'Returns matching document chunks' })
  async searchDocuments(
    @Req() req,
    @Query('query') query: string,
  ) {
    return this.documentService.searchDocuments(req.user.id, query);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a document' })
  @ApiResponse({ status: 200, description: 'Document successfully deleted' })
  async deleteDocument(@Param('id') id: string, @Req() req) {
    return this.documentService.deleteDocument(req.user.id, +id);
  }
} 