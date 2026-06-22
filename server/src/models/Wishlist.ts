import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/db';

export class Wishlist extends Model {
  public id!: string;
  public userId!: string;
  public productId!: string;
  public readonly createdAt!: Date;
}

Wishlist.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    productId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Wishlist',
    tableName: 'Wishlists',
    timestamps: true,
    updatedAt: false,
    indexes: [
      { unique: true, fields: ['userId', 'productId'] },
    ],
  }
);
