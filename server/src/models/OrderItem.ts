import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/db';

export class OrderItem extends Model {
  public id!: string;
  public orderId!: string;
  public productId!: string;
  public productName!: string;
  public quantity!: number;
  public size!: string;
  public price!: number;
  public customName!: string | null;
  public customNumber!: string | null;

  public toJSON(): object {
    const values = { ...this.get() } as any;
    values._id = values.id;
    
    if (values.product) {
      if (typeof values.product.toJSON === 'function') {
        values.product = values.product.toJSON();
      }
    } else {
      values.product = values.productId;
    }

    return values;
  }
}

OrderItem.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    orderId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    productId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    productName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    size: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    price: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    customName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    customNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'OrderItem',
    tableName: 'OrderItems',
    timestamps: false,
  }
);
