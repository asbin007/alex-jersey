import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/db';

export class Product extends Model {
  public id!: string;
  public name!: string;
  public slug!: string;
  public description!: string;
  public price!: number;
  public compareAtPrice!: number | null;
  public images!: string[];
  public category!: string;
  public team!: string;
  public player!: string | null;
  public jerseyType!: string;
  public tags!: string[];
  public isFeatured!: boolean;
  public isLimitedDrop!: boolean;
  public allowCustomization!: boolean;
  public rating!: number;
  public reviewCount!: number;
  public isActive!: boolean;
  public sizes?: any[];
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public toJSON(): object {
    const values = { ...this.get() } as any;
    values._id = values.id;
    return values;
  }
}

Product.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    price: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    compareAtPrice: {
      type: DataTypes.DOUBLE,
      allowNull: true,
    },
    images: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    team: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    player: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    jerseyType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
      allowNull: false,
    },
    isFeatured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    isLimitedDrop: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    allowCustomization: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    rating: {
      type: DataTypes.DOUBLE,
      defaultValue: 0,
      allowNull: false,
    },
    reviewCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Product',
    tableName: 'Products',
    timestamps: true,
  }
);
