import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/db';

export class Order extends Model {
  public id!: string;
  public orderNumber!: string;
  public userId!: string;
  public subtotal!: number;
  public deliveryCharge!: number;
  public total!: number;
  public status!: string;
  public paymentStatus!: 'unpaid' | 'paid';
  public paymentMethod!: string;
  public customerName!: string;
  public customerPhone!: string;
  public deliveryAddress!: string;
  public customerCity!: string;
  public customerNote!: string | null;
  public whatsappConfirmed!: boolean;
  public deliveryBoyId!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public toJSON(): object {
    const values = { ...this.get() } as any;
    values._id = values.id;
    
    if (values.user) {
      if (typeof values.user.toJSON === 'function') {
        values.user = values.user.toJSON();
      }
    } else {
      values.user = values.userId;
    }

    values.customer = {
      name: values.customerName,
      phone: values.customerPhone,
      deliveryAddress: values.deliveryAddress,
      city: values.customerCity,
      note: values.customerNote || undefined,
    };

    // paymentStatus and deliveryBoyId are included as-is

    return values;
  }
}

Order.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    orderNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    subtotal: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    deliveryCharge: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    total: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'pending',
      allowNull: false,
    },
    paymentMethod: {
      type: DataTypes.STRING,
      defaultValue: 'cod',
      allowNull: false,
    },
    customerName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    customerPhone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    deliveryAddress: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    customerCity: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    customerNote: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    whatsappConfirmed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    paymentStatus: {
      type: DataTypes.STRING,
      defaultValue: 'unpaid',
      allowNull: false,
    },
    deliveryBoyId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Order',
    tableName: 'Orders',
    timestamps: true,
  }
);
