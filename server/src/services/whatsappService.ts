/**
 * whatsappService.ts
 *
 * Thin wrapper around WAHA (WhatsApp HTTP API) — a self-hosted REST gateway.
 *
 * WAHA_URL must be set to the external URL of your deployed WAHA service.
 * e.g.  WAHA_URL=https://waha.yourservice.onrender.com
 *
 * Never use http://localhost or 127.0.0.1 in production — those addresses
 * are unreachable inside a Render container.
 */

const WAHA_URL     = process.env.WAHA_URL;
const SESSION      = process.env.WAHA_SESSION || 'default';
const WAHA_API_KEY = process.env.WAHA_API_KEY || '';

/**
 * Guards against a missing or localhost WAHA_URL in production.
 * Returns a descriptive message if WAHA is misconfigured, or null if OK.
 */
function validateWahaConfig(): string | null {
  if (!WAHA_URL) {
    return 'WAHA_URL environment variable is not set';
  }
  if (
    process.env.NODE_ENV === 'production' &&
    (WAHA_URL.includes('localhost') || WAHA_URL.includes('127.0.0.1'))
  ) {
    return `WAHA_URL is set to a localhost address (${WAHA_URL}) which is unreachable in production`;
  }
  return null;
}

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
 *
 * Errors are caught and logged but never rethrown — a WhatsApp
 * failure must never block an order or other business logic.
 */
export async function sendText(phone: string, text: string): Promise<void> {
  const configError = validateWahaConfig();
  if (configError) {
    console.warn(`[WAHA] Skipping sendText — ${configError}`);
    return;
  }

  const chatId = toChatId(phone);
  const url    = `${WAHA_URL}/api/sendText`;

  console.log(`[WAHA] → POST ${url}  chatId=${chatId}  session=${SESSION}`);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(WAHA_API_KEY ? { 'X-Api-Key': WAHA_API_KEY } : {}),
      },
      body: JSON.stringify({ session: SESSION, chatId, text }),
    });

    const responseBody = await res.text();
    console.log(`[WAHA] ← ${res.status} ${res.statusText}  body=${responseBody.slice(0, 200)}`);

    if (!res.ok) {
      console.error(
        `[WAHA] sendText failed — status=${res.status}  chatId=${chatId}  body=${responseBody}`
      );
    }
  } catch (err: any) {
    // Translate low-level network errors into readable log messages
    if (err?.code === 'ECONNREFUSED') {
      console.error(
        `[WAHA] ECONNREFUSED — Cannot reach WAHA at ${WAHA_URL}. ` +
        `Ensure WAHA_URL points to a running WAHA instance and is not localhost/127.0.0.1 in production.`
      );
    } else if (err?.code === 'ETIMEDOUT' || err?.name === 'TimeoutError') {
      console.error(`[WAHA] ETIMEDOUT — Request to ${url} timed out.`);
    } else if (err?.cause?.code === 'ECONNREFUSED') {
      // Node 18+ wraps the cause
      console.error(
        `[WAHA] ECONNREFUSED (nested) — Cannot reach WAHA at ${WAHA_URL}. ` +
        `Set WAHA_URL to your deployed WAHA service URL.`
      );
    } else {
      console.error(`[WAHA] sendText network error:`, err);
    }
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
