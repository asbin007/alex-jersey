import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/db';

/**
 * Stores every inbound WhatsApp message received via WAHA webhook.
 * Outbound messages are fire-and-forget (not stored here).
 */
export class WhatsAppMessage extends Model {
  public id!: string;
  public from!: string;           // "9779841234567@c.us"
  public fromName!: string | null;
  public body!: string;
  public waMessageId!: string;    // WAHA's internal message ID
  public session!: string;
  public isRead!: boolean;
  public repliedWith!: string | null;  // auto-reply sent back, if any
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

WhatsAppMessage.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    from: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fromName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    body: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    waMessageId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,   // prevent duplicate inserts on retried webhooks
    },
    session: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'default',
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    repliedWith: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    sequelize,
    modelName: 'WhatsAppMessage',
    tableName: 'WhatsAppMessages',
    timestamps: true,
  }
);
