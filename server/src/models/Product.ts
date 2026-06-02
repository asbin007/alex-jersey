import mongoose, { Schema, Document } from 'mongoose';
import { Product as IProduct, ProductCategory, JerseyType, Size, SizeStock } from '../types';

export interface ProductDocument extends Omit<IProduct, '_id'>, Document {}

const sizeStockSchema = new Schema<SizeStock>(
  {
    size: {
      type: String,
      enum: ['S', 'M', 'L', 'XL', 'XXL'] as Size[],
      required: true,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
  },
  { _id: false }
);

const productSchema = new Schema<ProductDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    compareAtPrice: {
      type: Number,
      min: 0,
    },
    images: {
      type: [String],
      validate: {
        validator: (v: string[]) => v.length >= 1,
        message: 'At least one image is required',
      },
    },
    category: {
      type: String,
      enum: ['worldcup', 'retro', 'club', 'streetwear'] as ProductCategory[],
      required: true,
    },
    team: {
      type: String,
      required: true,
      trim: true,
    },
    player: {
      type: String,
      trim: true,
    },
    jerseyType: {
      type: String,
      enum: ['home', 'away', 'third', 'retro', 'custom'] as JerseyType[],
      required: true,
    },
    sizes: {
      type: [sizeStockSchema],
      validate: {
        validator: (v: SizeStock[]) => v.length >= 1,
        message: 'At least one size is required',
      },
    },
    tags: {
      type: [String],
      default: [],
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isLimitedDrop: {
      type: Boolean,
      default: false,
    },
    allowCustomization: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Text index for full-text search on name, team, tags, description
productSchema.index(
  { name: 'text', team: 'text', tags: 'text', description: 'text' },
  { weights: { name: 10, team: 5, tags: 3, description: 1 } }
);

// Slug auto-generation from name using pre-save hook
productSchema.pre('save', function (next) {
  if (this.isModified('name') || this.isNew) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
  next();
});

const Product = mongoose.model<ProductDocument>('Product', productSchema);

export default Product;
