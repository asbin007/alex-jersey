import Order, { OrderDocument } from '../models/Order';
import Product from '../models/Product';
import { envConfig } from '../config/config';
import { CreateOrderDTO, OrderFilters, CartItem } from '../types/dto';
import { OrderStatus, PaginatedResult } from '../types';
import { calculateDeliveryCharge } from '../utils/deliveryCharge';
import { generateOrderNumber } from '../utils/orderNumber';

export interface OrderResponse {
  order: OrderDocument;
  whatsappUrl: string;
}

/**
 * Custom error class for validation errors in the order service.
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Validates customization requests against product allowCustomization settings
 * and enforces field-level rules on customName and customNumber.
 *
 * Rules:
 *  - customName: optional, max 20 characters, letters and spaces only
 *  - customNumber: optional, integer between 1 and 99 (stored as string in CartItem)
 *  - If either field is provided, the product must have allowCustomization = true
 *
 * @precondition items is an array of cart items
 * @postcondition If any item has customName/customNumber on a product that disallows customization, throws ValidationError
 * @postcondition If customName violates format rules or customNumber is out of range, throws ValidationError
 */
export async function validateCustomization(items: CartItem[]): Promise<void> {
  const nameRegex = /^[a-zA-Z\s]*$/;

  for (const item of items) {
    const hasCustomName = item.customName !== undefined && item.customName !== null && item.customName !== '';
    const hasCustomNumber = item.customNumber !== undefined && item.customNumber !== null && item.customNumber !== '';

    // Validate customName format if provided
    if (hasCustomName) {
      const name = item.customName as string;
      if (name.length > 20) {
        throw new ValidationError('Custom name must not exceed 20 characters');
      }
      if (!nameRegex.test(name)) {
        throw new ValidationError('Custom name must contain only letters and spaces');
      }
    }

    // Validate customNumber range if provided (may arrive as string from JSON)
    // Valid range is 0–99
    if (hasCustomNumber) {
      const num = Number(item.customNumber);
      if (!Number.isInteger(num) || num < 0 || num > 99) {
        throw new ValidationError('Custom number must be an integer between 0 and 99');
      }
    }

    // Only check allowCustomization when customization is actually requested
    if (!hasCustomName && !hasCustomNumber) {
      continue;
    }

    const product = await Product.findById(item.productId);
    if (!product) {
      throw new ValidationError(`Product ${item.productId} not found`);
    }

    if (!product.allowCustomization) {
      throw new ValidationError(
        `Product "${product.name}" does not allow customization`
      );
    }
  }
}

/**
 * Creates a new order with stock validation, delivery charge calculation,
 * and WhatsApp message generation.
 *
 * @precondition userId is a valid authenticated user ID
 * @precondition data.items has at least 1 item with valid productId, quantity > 0, valid size
 * @postcondition Order is saved in DB, stock is decremented, WhatsApp URL is returned
 */
export async function createOrder(
  userId: string,
  data: CreateOrderDTO
): Promise<OrderResponse> {
  const { items, customerName, phone, deliveryAddress, city, note } = data;

  if (!items || items.length === 0) {
    throw new ValidationError('At least one item is required');
  }

  // Validate customization before proceeding
  await validateCustomization(items);

  // Step 1: Validate stock availability for all items
  for (const item of items) {
    const product = await Product.findById(item.productId);
    if (!product) {
      throw new ValidationError(`Product ${item.productId} not found`);
    }

    const sizeEntry = product.sizes.find((s) => s.size === item.size);
    if (!sizeEntry || sizeEntry.stock < item.quantity) {
      throw new ValidationError(
        `Insufficient stock for ${product.name} size ${item.size}`
      );
    }
  }

  // Step 2: Calculate subtotal and build order items
  let subtotal = 0;
  const orderItems = [];

  for (const item of items) {
    const product = await Product.findById(item.productId);
    if (!product) {
      throw new ValidationError(`Product ${item.productId} not found`);
    }

    const itemTotal = product.price * item.quantity;
    subtotal += itemTotal;

    orderItems.push({
      product: product._id,
      productName: product.name,
      quantity: item.quantity,
      size: item.size,
      price: itemTotal,
      customName: item.customName,
      customNumber: item.customNumber,
    });
  }

  const deliveryCharge = calculateDeliveryCharge(city);
  const total = subtotal + deliveryCharge;

  // Step 3: Create the order
  const orderNumber = generateOrderNumber();
  const order = await Order.create({
    orderNumber,
    user: userId,
    items: orderItems,
    subtotal,
    deliveryCharge,
    total,
    status: 'pending',
    paymentMethod: 'cod',
    customer: {
      name: customerName,
      phone,
      deliveryAddress,
      city,
      note,
    },
    statusHistory: [{ status: 'pending', timestamp: new Date() }],
  });

  // Step 4: Decrement stock for each ordered item
  for (const item of items) {
    await Product.updateOne(
      { _id: item.productId, 'sizes.size': item.size },
      { $inc: { 'sizes.$.stock': -item.quantity } }
    );
  }

  // Step 5: Generate WhatsApp URL
  const whatsappUrl = generateWhatsAppMessage(order);

  return { order, whatsappUrl };
}

/**
 * Retrieves an order by its ID with populated user and product references.
 */
export async function getOrderById(
  id: string
): Promise<OrderDocument | null> {
  return Order.findById(id)
    .populate('user', 'name email phone')
    .populate('items.product', 'name slug images price');
}

/**
 * Retrieves all orders for a specific user, sorted by creation date (newest first).
 *
 * @precondition userId is a valid user ID
 * @postcondition Returns orders belonging to that user sorted by createdAt descending
 */
export async function getUserOrders(
  userId: string
): Promise<OrderDocument[]> {
  return Order.find({ user: userId })
    .sort({ createdAt: -1 })
    .populate('items.product', 'name slug images price');
}

/**
 * Updates the status of an order and appends to status history.
 *
 * @precondition orderId references an existing order
 * @precondition status is a valid OrderStatus value
 * @postcondition Order status is updated and statusHistory grows by one entry
 */
export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  note?: string
): Promise<OrderDocument | null> {
  const order = await Order.findById(orderId);
  if (!order) {
    throw new ValidationError('Order not found');
  }

  order.status = status;
  order.statusHistory.push({
    status,
    timestamp: new Date(),
    note,
  });

  await order.save();
  return order;
}

/**
 * Retrieves all orders with optional filters and pagination (admin use).
 *
 * @postcondition Returns paginated orders with populated user and product details
 */
export async function getAllOrders(
  filters: OrderFilters = {}
): Promise<PaginatedResult<OrderDocument>> {
  const { status, startDate, endDate, page = 1, limit = 10 } = filters;

  const query: Record<string, any> = {};

  if (status) {
    query.status = status;
  }

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) {
      query.createdAt.$gte = new Date(startDate);
    }
    if (endDate) {
      query.createdAt.$lte = new Date(endDate);
    }
  }

  const total = await Order.countDocuments(query);
  const totalPages = Math.ceil(total / limit);
  const skip = (page - 1) * limit;

  const data = await Order.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('user', 'name email phone')
    .populate('items.product', 'name slug images price');

  return {
    data,
    total,
    page,
    totalPages,
    hasNext: page < totalPages,
  };
}

/**
 * Generates a WhatsApp message URL with all order details encoded.
 *
 * @precondition order is a saved order with valid orderNumber and items
 * @postcondition Returns a valid wa.me URL with encoded message containing all order details
 */
export function generateWhatsAppMessage(order: OrderDocument): string {
  const lines: string[] = [];

  lines.push('🏆 NEW ORDER - Nepal Jersey Store');
  lines.push(`📋 Order: ${order.orderNumber}`);
  lines.push('');
  lines.push(`👤 Customer: ${order.customer.name}`);
  lines.push(`📱 Phone: ${order.customer.phone}`);
  lines.push(
    `📍 Address: ${order.customer.deliveryAddress}, ${order.customer.city}`
  );
  lines.push('');
  lines.push('🛒 Items:');

  for (const item of order.items) {
    let itemLine = `  • ${item.productName} (${item.size}) x${item.quantity} - Rs.${item.price}`;
    if (item.customName || item.customNumber) {
      itemLine += ` [Custom: ${item.customName || ''} ${item.customNumber || ''}]`;
    }
    lines.push(itemLine);
  }

  lines.push('');
  lines.push(`💰 Subtotal: Rs.${order.subtotal}`);
  lines.push(`🚚 Delivery: Rs.${order.deliveryCharge}`);
  lines.push(`💵 Total: Rs.${order.total}`);
  lines.push('💳 Payment: Cash on Delivery');

  if (order.customer.note) {
    lines.push(`📝 Note: ${order.customer.note}`);
  }

  const message = lines.join('\n');
  const encodedMessage = encodeURIComponent(message);
  const whatsappNumber = envConfig.whatsappBusinessNumber;

  return `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
}

export const orderService = {
  createOrder,
  getOrderById,
  getUserOrders,
  updateOrderStatus,
  getAllOrders,
  generateWhatsAppMessage,
  validateCustomization,
};
