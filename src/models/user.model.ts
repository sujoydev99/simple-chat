import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import { Document } from './document.model';
import { Thread } from './thread.model';
import { Message } from './message.model';
import bcrypt from 'bcrypt';

@Table
export class User extends Model {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  })
  declare email: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare password: string;

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

  @HasMany(() => Document)
  declare documents: Document[];

  @HasMany(() => Thread)
  declare threads: Thread[];

  @HasMany(() => Message)
  declare messages: Message[];
}
