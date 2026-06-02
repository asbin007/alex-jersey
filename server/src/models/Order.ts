import mongoose, { Schema, Document } from 'mongoose';
import { Order as IOrder, OrderStatus, PaymentMethod, OrderItem, CustomerInfo, StatusHistoryEntry } from '../types';

export interface OrderDocument extends Omit<IOrder, '_id'>, Document {}

const orderItemSchema = new Schema<OrderItem>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    productName: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    size: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    customName: {
      type: String,
    },
    customNumber: {
      type: String,
    },
  },
  { _id: false }
);

const customerInfoSchema = new Schema<CustomerInfo>(
  {
    name: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      validate: {
        validator: function (v: string) {
          return /^(97|98)\d{8}$/.test(v);
        },
        message: 'Phone must be a valid Nepal number (10 digits starting with 97 or 98)',
      },
    },
    deliveryAddress: {
      type: String,
      required: [true, 'Delivery address is required'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },
    note: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

const statusHistorySchema = new Schema<StatusHistoryEntry>(
  {
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'] as OrderStatus[],
      required: true,
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
    },
    note: {
      type: String,
    },
  },
  { _id: false }
);

const orderSchema = new Schema<OrderDocument>(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: {
      type: [orderItemSchema],
      validate: {
        validator: (v: OrderItem[]) => v.length >= 1,
        message: 'At least one item is required',
      },
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    deliveryCharge: {
      type: Number,
      required: true,
      min: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'] as OrderStatus[],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['cod'] as PaymentMethod[],
      default: 'cod',
    },
    customer: {
      type: customerInfoSchema,
      required: true,
    },
    whatsappConfirmed: {
      type: Boolean,
      default: false,
    },
    statusHistory: {
      type: [statusHistorySchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model<OrderDocument>('Order', orderSchema);

export default Order;
