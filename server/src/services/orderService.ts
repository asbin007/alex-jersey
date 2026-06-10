import { Op } from 'sequelize';
import { sequelize } from '../config/db';
import { envConfig } from '../config/config';
import { Product, SizeStock, Order, OrderItem, StatusHistoryEntry, User } from '../models/associations';
import { CreateOrderDTO, OrderFilters, CartItem } from '../types/dto';
import { OrderStatus, PaginatedResult } from '../types';
import { calculateDeliveryCharge } from '../utils/deliveryCharge';
import { generateOrderNumber } from '../utils/orderNumber';

export interface OrderResponse {
  order: any;
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
 */
export async function validateCustomization(items: CartItem[], t?: any): Promise<void> {
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

    const product = await Product.findByPk(item.productId, { transaction: t });
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
 */
export async function createOrder(
  userId: string,
  data: CreateOrderDTO
): Promise<OrderResponse> {
  const { items, customerName, phone, deliveryAddress, city, note } = data;

  if (!items || items.length === 0) {
    throw new ValidationError('At least one item is required');
  }

  // Wrap inside a Sequelize Transaction to ensure data consistency
  return sequelize.transaction(async (t) => {
    // Step 1: Validate customization before proceeding
    await validateCustomization(items, t);

    // Step 2: Validate stock availability for all items
    for (const item of items) {
      const product = await Product.findByPk(item.productId, {
        include: [{ model: SizeStock, as: 'sizes' }],
        transaction: t,
      });
      if (!product) {
        throw new ValidationError(`Product ${item.productId} not found`);
      }

      const sizeEntry = product.sizes?.find((s: any) => s.size === item.size);
      if (!sizeEntry || sizeEntry.stock < item.quantity) {
        throw new ValidationError(
          `Insufficient stock for ${product.name} size ${item.size}`
        );
      }
    }

    // Step 3: Calculate subtotal and build order items
    let subtotal = 0;
    const orderItemsData = [];

    for (const item of items) {
      const product = await Product.findByPk(item.productId, { transaction: t });
      if (!product) {
        throw new ValidationError(`Product ${item.productId} not found`);
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      orderItemsData.push({
        productId: product.id,
        productName: product.name,
        quantity: item.quantity,
        size: item.size,
        price: itemTotal,
        customName: item.customName,
        customNumber: item.customNumber,
      });

      // Step 4: Decrement stock for each ordered item in SizeStock
      const sizeStock = await SizeStock.findOne({
        where: { productId: product.id, size: item.size },
        transaction: t,
      });
      if (sizeStock) {
        sizeStock.stock -= item.quantity;
        await sizeStock.save({ transaction: t });
      }
    }

    const deliveryCharge = calculateDeliveryCharge(city);
    const total = subtotal + deliveryCharge;

    // Step 5: Create the order
    const orderNumber = generateOrderNumber();
    const order = await Order.create({
      orderNumber,
      userId,
      subtotal,
      deliveryCharge,
      total,
      status: 'pending',
      paymentMethod: 'cod',
      customerName,
      customerPhone: phone,
      deliveryAddress,
      customerCity: city,
      customerNote: note,
      whatsappConfirmed: false,
    }, { transaction: t });

    // Step 6: Create the order items
    await OrderItem.bulkCreate(
      orderItemsData.map((oi) => ({
        ...oi,
        orderId: order.id,
      })),
      { transaction: t }
    );

    // Step 7: Create status history entry
    await StatusHistoryEntry.create({
      orderId: order.id,
      status: 'pending',
      note: 'Order created',
    }, { transaction: t });

    // Step 8: Fetch complete order with relations to return
    const completeOrder = await Order.findByPk(order.id, {
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [{ model: Product, as: 'product', attributes: ['name', 'slug', 'images', 'price'] }],
        },
        { model: StatusHistoryEntry, as: 'statusHistory' },
      ],
      transaction: t,
    });

    // Step 9: Generate WhatsApp URL
    const whatsappUrl = generateWhatsAppMessage(completeOrder);

    return { order: completeOrder, whatsappUrl };
  });
}

/**
 * Retrieves an order by its ID with populated user and product references.
 */
export async function getOrderById(
  id: string
): Promise<any | null> {
  return Order.findByPk(id, {
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['name', 'email', 'phone'],
      },
      {
        model: OrderItem,
        as: 'items',
        include: [{ model: Product, as: 'product', attributes: ['name', 'slug', 'images', 'price'] }],
      },
      {
        model: StatusHistoryEntry,
        as: 'statusHistory',
      },
    ],
  });
}

/**
 * Retrieves all orders for a specific user, sorted by creation date (newest first).
 */
export async function getUserOrders(
  userId: string
): Promise<any[]> {
  return Order.findAll({
    where: { userId },
    order: [['createdAt', 'DESC']],
    include: [
      {
        model: OrderItem,
        as: 'items',
        include: [{ model: Product, as: 'product', attributes: ['name', 'slug', 'images', 'price'] }],
      },
    ],
  });
}

/**
 * Updates the status of an order and appends to status history.
 */
export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  note?: string
): Promise<any | null> {
  return sequelize.transaction(async (t) => {
    const order = await Order.findByPk(orderId, { transaction: t });
    if (!order) {
      throw new ValidationError('Order not found');
    }

    await order.update({ status }, { transaction: t });

    await StatusHistoryEntry.create({
      orderId: order.id,
      status,
      note,
    }, { transaction: t });

    return Order.findByPk(orderId, {
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [{ model: Product, as: 'product', attributes: ['name', 'slug', 'images', 'price'] }],
        },
        { model: StatusHistoryEntry, as: 'statusHistory' },
      ],
      transaction: t,
    });
  });
}

/**
 * Retrieves all orders with optional filters and pagination (admin use).
 */
export async function getAllOrders(
  filters: OrderFilters = {}
): Promise<PaginatedResult<any>> {
  const { status, startDate, endDate, page = 1, limit = 10 } = filters;

  const where: any = {};

  if (status) {
    where.status = status;
  }

  if (startDate || endDate) {
    const dateWhere: any = {};
    if (startDate) {
      dateWhere[Op.gte] = new Date(startDate);
    }
    if (endDate) {
      dateWhere[Op.lte] = new Date(endDate);
    }
    where.createdAt = dateWhere;
  }

  const offset = (page - 1) * limit;

  const { rows, count } = await Order.findAndCountAll({
    where,
    order: [['createdAt', 'DESC']],
    limit,
    offset,
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['name', 'email', 'phone'],
      },
      {
        model: OrderItem,
        as: 'items',
        include: [{ model: Product, as: 'product', attributes: ['name', 'slug', 'images', 'price'] }],
      },
    ],
    distinct: true,
  });

  const totalPages = Math.ceil(count / limit);

  return {
    data: rows,
    total: count,
    page,
    totalPages,
    hasNext: page < totalPages,
  };
}

/**
 * Generates a WhatsApp message URL with all order details encoded.
 */
export function generateWhatsAppMessage(order: any): string {
  const lines: string[] = [];

  lines.push('🏆 NEW ORDER - Nepal Jersey Store');
  lines.push(`📋 Order: ${order.orderNumber}`);
  lines.push('');
  lines.push(`👤 Customer: ${order.customerName}`);
  lines.push(`📱 Phone: ${order.customerPhone}`);
  lines.push(
    `📍 Address: ${order.deliveryAddress}, ${order.customerCity}`
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

  if (order.customerNote) {
    lines.push(`📝 Note: ${order.customerNote}`);
  }

  const message = lines.join('\n');
  const encodedMessage = encodeURIComponent(message);
  const whatsappNumber = envConfig.whatsappBusinessNumber;

  return `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
}

/**
 * Updates the payment status of an order (admin only).
 */
export async function updatePaymentStatus(
  orderId: string,
  paymentStatus: 'paid' | 'unpaid'
): Promise<any | null> {
  const order = await Order.findByPk(orderId);
  if (!order) return null;
  await order.update({ paymentStatus });
  return Order.findByPk(orderId, {
    include: [
      { model: OrderItem, as: 'items' },
      { model: StatusHistoryEntry, as: 'statusHistory' },
    ],
  });
}

/**
 * Assigns (or unassigns) a delivery boy to an order.
 */
export async function assignDeliveryBoy(
  orderId: string,
  deliveryBoyId: string | null
): Promise<any | null> {
  const order = await Order.findByPk(orderId);
  if (!order) return null;
  await order.update({ deliveryBoyId });
  return Order.findByPk(orderId, {
    include: [
      { model: OrderItem, as: 'items' },
      { model: StatusHistoryEntry, as: 'statusHistory' },
    ],
  });
}

/**
 * Get orders assigned to a specific delivery boy.
 * If deliveryBoyId is null (admin calling), returns all orders that have any delivery boy assigned.
 */
export async function getDeliveryBoyOrders(deliveryBoyId: string): Promise<any[]> {
  return Order.findAll({
    where: { deliveryBoyId },
    order: [['createdAt', 'DESC']],
    include: [
      {
        model: OrderItem,
        as: 'items',
        include: [{ model: Product, as: 'product', attributes: ['name', 'slug', 'images', 'price'] }],
      },
      { model: StatusHistoryEntry, as: 'statusHistory' },
    ],
  });
}

/**
 * Get all orders for delivery portal — includes deliveryBoyId for "yours" labeling.
 */
export async function getAllOrdersForDelivery(deliveryBoyId?: string): Promise<any[]> {
  return Order.findAll({
    order: [['createdAt', 'DESC']],
    include: [
      {
        model: OrderItem,
        as: 'items',
        include: [{ model: Product, as: 'product', attributes: ['name', 'slug', 'images', 'price'] }],
      },
      { model: StatusHistoryEntry, as: 'statusHistory' },
    ],
  });
}

export const orderService = {
  createOrder,
  getOrderById,
  getUserOrders,
  updateOrderStatus,
  updatePaymentStatus,
  assignDeliveryBoy,
  getDeliveryBoyOrders,
  getAllOrdersForDelivery,
  getAllOrders,
  generateWhatsAppMessage,
  validateCustomization,
};
