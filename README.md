# Simple RAG Application

A simple Retrieval-Augmented Generation (RAG) application built with NestJS, PostgreSQL, and Weaviate.

## Features

- User authentication with JWT
- Document upload and processing
- Text embedding generation using OpenAI
- Vector storage with Weaviate
- RESTful API with Swagger documentation

## Tech Stack

- **Backend**: NestJS
- **Database**: PostgreSQL
- **Vector Database**: Weaviate
- **Authentication**: JWT
- **Document Processing**: OpenAI Embeddings
- **API Documentation**: Swagger

## Database Schema

### Models

#### DataSources
- `doc_id`: Unique identifier
- `document_name`: Name of the document
- `userId`: Reference to user

#### Threads
- `userId`: Reference to user
- `title`: Thread title

#### Messages
- `threadId`: Reference to thread
- `userId`: Reference to user
- `role`: 'user' or 'assistant'

#### Users
- `id`: Unique identifier
- `email`: User email
- `password`: Hashed password (using bcrypt)

## Application Flow

1. User Authentication
   - Sign up
   - Sign in (JWT token generation)

2. Document Processing
   - Upload documents (5MB limit)
   - Supported formats: PDF, TXT, CSV, JSON
   - Document processing:
     - Save locally in `/docs/doc_id.<ext>`
     - Generate embeddings using OpenAI
     - Store embeddings in Weaviate with metadata:
       - Document name
       - Page number
       - Line number
       - Raw text

## Project Structure

All modules are organized under `src/pkg` folder with the following structure for each entity:
- Controller
- Service
- Module
- DTOs

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Configure your environment variables

4. Start the application:
   ```bash
   npm run start:dev
   # or
   yarn start:dev
   ```

## API Documentation

Swagger documentation is available at `/api` endpoint when the application is running.

## Notes

- All database models use Sequelize with paranoid deletion
- JWT authentication middleware is implemented
- Swagger documentation is added via NestJS decorators 