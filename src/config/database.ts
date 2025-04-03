import { Sequelize } from 'sequelize-typescript';
import { User } from '../models/user.model';
import { Document } from '../models/document.model';
import { Thread } from '../models/thread.model';
import { Message } from '../models/message.model';

export const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'simple_rag',
  models: [User, Document, Thread, Message],
  logging: false,
  define: {
    timestamps: true,
    underscored: true,
  },
}); 