import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import * as orderService from '../services/orderService';
import { OrderStatus } from '../types';

/**
 * GET /api/delivery/orders
 * Returns ALL orders (not just assigned) for delivery boy.
 * Admin sees all too.
 */
export async function getMyDeliveries(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const role = req.user!.role;

    // Both delivery_boy and admin get all orders with delivery info
    const orders = role === 'admin'
      ? await orderService.getAllOrdersForDelivery()
      : await orderService.getAllOrdersForDelivery(userId);

    res.json(orders);
  } catch {
    res.status(500).json({ error: 'Failed to fetch deliveries' });
  }
}

/**
 * PATCH /api/delivery/orders/:id/status
 * Delivery boy can move an order to: ontheway, delivered
 */
export async function updateDeliveryStatus(req: Request, res: Response): Promise<void> {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  try {
    const { id } = req.params;
    const { status } = req.body as { status: OrderStatus };
    const userId = req.user!.userId;
    const role = req.user!.role;

    const existing = await orderService.getOrderById(id);
    if (!existing) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    // Delivery boys can update any order (per spec — they see all)
    const note = status === 'ontheway'
      ? `Picked up by delivery boy`
      : `Delivered by delivery boy`;

    const order = await orderService.updateOrderStatus(id, status, note);

    // Generate WhatsApp message for customer
    const customerPhone = existing.customerPhone;
    const whatsappMsg = status === 'ontheway'
      ? `Hi ${existing.customerName}! Your order *${existing.orderNumber}* is ON THE WAY 🚀 Our delivery boy is heading to you now!`
      : `Hi ${existing.customerName}! Your order *${existing.orderNumber}* has been DELIVERED ✅ Thank you for shopping with us!`;

    const whatsappUrl = `https://wa.me/977${customerPhone}?text=${encodeURIComponent(whatsappMsg)}`;

    res.json({ order, whatsappUrl });
  } catch {
    res.status(500).json({ error: 'Failed to update delivery status' });
  }
}
