import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/db';

export class SizeStock extends Model {
  public id!: string;
  public productId!: string;
  public size!: string;
  public stock!: number;

  public toJSON(): object {
    const values = { ...this.get() } as any;
    values._id = values.id;
    return values;
  }
}

SizeStock.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    productId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    size: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    stock: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'SizeStock',
    tableName: 'SizeStocks',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['productId', 'size'],
      },
    ],
  }
);
