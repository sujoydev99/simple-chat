import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from './user.model';

@Table
export class Document extends Model {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare name: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare userId: number;

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

  @BelongsTo(() => User)
  declare user: User;
} 