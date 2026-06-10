import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/db';

export class Review extends Model {
  public id!: string;
  public userId!: string;
  public productId!: string;
  public rating!: number;
  public comment!: string;
  public images!: string[];
  public isVerifiedPurchase!: boolean;
  public isApproved!: boolean;
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

Review.init(
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
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    images: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
      allowNull: false,
    },
    isVerifiedPurchase: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    isApproved: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Review',
    tableName: 'Reviews',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['userId', 'productId'],
      },
    ],
  }
);
