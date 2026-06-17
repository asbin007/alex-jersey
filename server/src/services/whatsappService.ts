/**
 * whatsappService.ts
 *
 * Thin wrapper around WAHA (WhatsApp HTTP API) — a self-hosted REST gateway.
 * Docs / Swagger: http://localhost:3000
 *
 * All calls are fire-and-forget. A WhatsApp failure must never block an order.
 */

const WAHA_URL     = process.env.WAHA_URL     || 'http://localhost:3000';
const SESSION      = process.env.WAHA_SESSION || 'default';
const WAHA_API_KEY = process.env.WAHA_API_KEY || '';

/**
 * Formats a Nepali phone number to WhatsApp chatId format.
 * e.g. "9841234567"    → "9779841234567@c.us"
 *      "9779841234567" → "9779841234567@c.us"
 */
function toChatId(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  const normalized = digits.startsWith('977') ? digits : `977${digits}`;
  return `${normalized}@c.us`;
}

/**
 * Core send — POSTs to WAHA's /api/sendText endpoint.
 * Exported so the webhook handler can use it for auto-replies.
 */
export async function sendText(phone: string, text: string): Promise<void> {
  const chatId = toChatId(phone);

  try {
    const res = await fetch(`${WAHA_URL}/api/sendText`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': WAHA_API_KEY,
      },
      body: JSON.stringify({ session: SESSION, chatId, text }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error(`[WAHA] Failed to send to ${chatId}: ${res.status} ${body}`);
    }
  } catch (err) {
    console.error('[WAHA] sendText error:', err);
  }
}

// ─── Public helpers ───────────────────────────────────────────────────────────

/**
 * Notify the customer when their order is placed.
 */
export async function notifyOrderPlaced(order: any): Promise<void> {
  if (!order.customerPhone) return;

  const itemLines = (order.items ?? [])
    .map((i: any) => `  • ${i.productName} (${i.size}) ×${i.quantity} — Rs.${i.price}`)
    .join('\n');

  const message = [
    `🏆 *Order Confirmed — Nepal Jersey Store*`,
    ``,
    `Hi ${order.customerName}! Your order has been received.`,
    ``,
    `📋 Order: *${order.orderNumber}*`,
    ``,
    `🛒 *Items:*`,
    itemLines,
    ``,
    `💰 Subtotal:   Rs.${order.subtotal}`,
    `🚚 Delivery:   Rs.${order.deliveryCharge}`,
    `💵 *Total:     Rs.${order.total}*`,
    `💳 Payment: Cash on Delivery`,
    ``,
    `📍 Delivering to: ${order.deliveryAddress}, ${order.customerCity}`,
    ``,
    `We'll notify you when your order is out for delivery. Thank you! 🙏`,
  ].join('\n');

  await sendText(order.customerPhone, message);
}

/**
 * Notify the customer when their order status changes.
 */
export async function notifyStatusUpdate(order: any, newStatus: string): Promise<void> {
  if (!order.customerPhone) return;

  const statusMessages: Record<string, string> = {
    confirmed:  `✅ Your order *${order.orderNumber}* has been confirmed and is being prepared.`,
    processing: `⚙️  Your order *${order.orderNumber}* is now being processed.`,
    shipped:    `🚚 Your order *${order.orderNumber}* is on its way! Expect delivery soon.`,
    delivered:  `🎉 Your order *${order.orderNumber}* has been delivered. Enjoy your jersey!`,
    cancelled:  `❌ Your order *${order.orderNumber}* has been cancelled. Contact us if this is a mistake.`,
  };

  const text = statusMessages[newStatus];
  if (!text) return;

  await sendText(order.customerPhone, `*Nepal Jersey Store*\n\n${text}`);
}

/**
 * Notify the delivery boy when an order is assigned to them.
 */
export async function notifyDeliveryBoyAssigned(
  deliveryBoyPhone: string,
  deliveryBoyName: string,
  order: any
): Promise<void> {
  const message = [
    `📦 *New Delivery Assignment — Nepal Jersey Store*`,
    ``,
    `Hi ${deliveryBoyName}! You have a new order to deliver.`,
    ``,
    `📋 Order: *${order.orderNumber}*`,
    `👤 Customer: ${order.customerName}`,
    `📱 Phone:    ${order.customerPhone}`,
    `📍 Address:  ${order.deliveryAddress}, ${order.customerCity}`,
    `💵 Total:    Rs.${order.total} (COD)`,
    ``,
    `Please confirm pickup when you collect the package.`,
  ].join('\n');

  await sendText(deliveryBoyPhone, message);
}

export const whatsappService = {
  notifyOrderPlaced,
  notifyStatusUpdate,
  notifyDeliveryBoyAssigned,
};
