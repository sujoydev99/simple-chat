import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { Thread } from './thread.model';
import { User } from './user.model';

@Table
export class Message extends Model {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  declare content: string;

  @Column({
    type: DataType.ENUM('user', 'assistant'),
    allowNull: false,
  })
  declare role: 'user' | 'assistant' | 'system' | 'tool';

  @ForeignKey(() => Thread)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare threadId: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare userId: number;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
  })
  declare rawData: {documentName: string, content: string}[];

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  declare readonly createdAt: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  declare readonly updatedAt: Date;

  @BelongsTo(() => Thread)
  declare thread: Thread;

  @BelongsTo(() => User)
  declare user: User;
} 