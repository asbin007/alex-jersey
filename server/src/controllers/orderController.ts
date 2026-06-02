import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import * as orderService from '../services/orderService';
import { ValidationError } from '../services/orderService';
import { CreateOrderDTO, OrderFilters } from '../types/dto';
import { OrderStatus } from '../types';

/**
 * POST /api/orders
 * Creates a new order (authenticated users only).
 */
export async function createOrder(req: Request, res: Response): Promise<void> {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  try {
    const userId = req.user!.userId;
    const orderData: CreateOrderDTO = {
      items: req.body.items,
      customerName: req.body.customerName,
      phone: req.body.phone,
      deliveryAddress: req.body.deliveryAddress,
      city: req.body.city,
      note: req.body.note,
    };

    const result = await orderService.createOrder(userId, orderData);
    res.status(201).json(result);
  } catch (error: any) {
    if (error instanceof ValidationError) {
      res.status(400).json({ error: error.message });
      return;
    }
    if (error.message?.includes('Insufficient stock') || error.message?.includes('not found')) {
      res.status(400).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Failed to create order' });
  }
}

/**
 * GET /api/orders/:id
 * Returns a single order by ID (authenticated users; users can only access their own orders).
 */
export async function getOrderById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const order = await orderService.getOrderById(id);

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    // Ensure the requesting user owns the order (unless admin)
    const userId = req.user!.userId;
    const role = req.user!.role;
    const orderUserId = order.user?.toString?.() ?? String(order.user);

    if (role !== 'admin' && orderUserId !== userId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    res.json(order);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch order' });
  }
}

/**
 * GET /api/orders/my-orders
 * Returns all orders for the authenticated user.
 */
export async function getMyOrders(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const orders = await orderService.getUserOrders(userId);
    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
}

/**
 * GET /api/admin/orders
 * Returns all orders with populated user and product details (admin only).
 */
export async function getAllOrders(req: Request, res: Response): Promise<void> {
  try {
    const orders = await orderService.getAllOrders();
    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
}

/**
 * PATCH /api/admin/orders/:id/status
 * Updates the status of an order (admin only).
 */
export async function updateOrderStatus(req: Request, res: Response): Promise<void> {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  try {
    const { id } = req.params;
    const { status } = req.body as { status: OrderStatus };

    const order = await orderService.updateOrderStatus(id, status);

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    res.json(order);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update order status' });
  }
}
