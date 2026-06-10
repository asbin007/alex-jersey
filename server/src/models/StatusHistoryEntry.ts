import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/db';

export class StatusHistoryEntry extends Model {
  public id!: string;
  public orderId!: string;
  public status!: string;
  public timestamp!: Date;
  public note!: string | null;

  public toJSON(): object {
    const values = { ...this.get() } as any;
    values._id = values.id;
    return values;
  }
}

StatusHistoryEntry.init(
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
    status: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
    note: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'StatusHistoryEntry',
    tableName: 'StatusHistoryEntries',
    timestamps: false,
  }
);
