import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/db';

export class User extends Model {
  public id!: string;
  public name!: string;
  public email!: string;
  public phone!: string | null;
  public passwordHash!: string | null;
  public googleId!: string | null;
  public role!: 'customer' | 'admin' | 'delivery_boy';
  public street!: string | null;
  public city!: string | null;
  public district!: string | null;
  public avatar!: string | null;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public toJSON(): object {
    const values = { ...this.get() } as any;
    values._id = values.id;
    delete values.passwordHash;
    if (values.city) {
      values.address = {
        street: values.street || '',
        city: values.city,
        district: values.district || values.city,
      };
    }
    return values;
  }
}

User.init(
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
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,  // nullable — Google OAuth users may not have a phone
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: true,  // nullable — Google OAuth users have no password
    },
    googleId: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    role: {
      type: DataTypes.STRING,
      defaultValue: 'customer',
      allowNull: false,
    },
    street: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    district: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    avatar: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'Users',
    timestamps: true,
  }
);
