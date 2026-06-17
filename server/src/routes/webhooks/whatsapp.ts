import { Router, Request, Response } from 'express';
import { WhatsAppMessage } from '../../models/WhatsAppMessage';
import { Order } from '../../models/associations';
import { sendText } from '../../services/whatsappService';
import { Op } from 'sequelize';

const router = Router();

// ─── Auto-reply helpers ───────────────────────────────────────────────────────

/**
 * Strips Nepal country code and @c.us suffix to get a bare 10-digit phone.
 * "9779841234567@c.us" → "9841234567"
 */
function normalizePhone(waId: string): string {
  return waId.replace('@c.us', '').replace('@lid', '').replace(/^977/, '');
}

/**
 * Looks up orders by customer phone and returns a status summary.
 */
async function getOrderStatusReply(phone: string): Promise<string | null> {
  const normalized = normalizePhone(phone);

  const orders = await Order.findAll({
    where: {
      customerPhone: { [Op.like]: `%${normalized}%` },
    },
    order: [['createdAt', 'DESC']],
    limit: 3,
    attributes: ['orderNumber', 'status', 'total', 'createdAt'],
  });

  if (!orders.length) return null;

  const lines = orders.map((o: any) => {
    const statusEmoji: Record<string, string> = {
      pending:    '🕐',
      confirmed:  '✅',
      processing: '⚙️',
      shipped:    '🚚',
      delivered:  '🎉',
      cancelled:  '❌',
    };
    const emoji = statusEmoji[o.status] ?? '📦';
    const date  = new Date(o.createdAt).toLocaleDateString('en-NP');
    return `${emoji} *${o.orderNumber}* — ${o.status} (Rs.${o.total}) — ${date}`;
  });

  return [
    `*Nepal Jersey Store — Order Status* 🏆`,
    ``,
    ...lines,
    ``,
    `Reply with your order number for more details.`,
    `📞 For help: contact our support team.`,
  ].join('\n');
}

/**
 * Parses the text and decides what auto-reply (if any) to send.
 * Returns the reply text, or null if no auto-reply needed.
 */
async function buildAutoReply(body: string, from: string): Promise<string | null> {
  const text = body.trim().toLowerCase();

  // Order status keywords
  if (
    text.includes('order') ||
    text.includes('status') ||
    text.includes('track') ||
    text.includes('where') ||
    text.includes('delivery') ||
    text.startsWith('nj-')
  ) {
    const statusReply = await getOrderStatusReply(from);
    if (statusReply) return statusReply;
  }

  // Greeting → send menu
  if (
    text === 'hi' || text === 'hello' || text === 'hey' ||
    text === 'namaste' || text === 'helo' || text === 'help'
  ) {
    return [
      `👋 *Welcome to Nepal Jersey Store!*`,
      ``,
      `How can we help you?`,
      ``,
      `1️⃣  Reply *ORDER* to check your order status`,
      `2️⃣  Reply *CANCEL* to cancel an order`,
      `3️⃣  Visit our store: https://alexjersey.rocks`,
      ``,
      `Our team will respond shortly. 🙏`,
    ].join('\n');
  }

  // Cancel request
  if (text.includes('cancel')) {
    return [
      `❌ *Cancel Order Request Received*`,
      ``,
      `To cancel your order, please provide:`,
      `• Your order number (e.g. NJ-20260615-XXXX)`,
      `• Reason for cancellation`,
      ``,
      `Our team will process your request within 2 hours.`,
    ].join('\n');
  }

  return null;
}

// ─── Webhook endpoint ─────────────────────────────────────────────────────────

/**
 * POST /api/webhooks/whatsapp
 *
 * WAHA posts events here. We handle:
 *   - message       → store + optional auto-reply
 *   - session.status → log (future: push to admin via SSE/WS)
 *
 * Always return 200 quickly — WAHA retries on non-2xx.
 */
router.post('/', async (req: Request, res: Response) => {
  // Acknowledge immediately so WAHA doesn't retry
  res.sendStatus(200);

  const event = req.body as {
    event: string;
    session: string;
    payload?: any;
  };

  // Only care about incoming messages (not our own outbound messages)
  if (event.event !== 'message') return;

  const payload = event.payload;
  if (!payload || payload.fromMe) return;          // skip messages we sent
  if (payload.type !== 'chat') return;             // skip media/sticker/etc for now

  const from       = payload.from  as string;      // "9779841234567@c.us"
  const fromName   = payload._data?.notifyName ?? payload.sender?.pushName ?? null;
  const body       = (payload.body as string) ?? '';
  const waMessageId = payload.id?._serialized ?? payload.id ?? String(Date.now());

  if (!body.trim()) return;

  try {
    // Store in DB (unique constraint on waMessageId prevents duplicates)
    const msg = await WhatsAppMessage.create({
      from,
      fromName,
      body,
      waMessageId,
      session: event.session ?? 'default',
    });

    // Build and send auto-reply if applicable
    const reply = await buildAutoReply(body, from);
    if (reply) {
      const barePhone = from.replace('@c.us', '').replace('@lid', '').replace(/^977/, '');
      await sendText(barePhone, reply).catch(() => {/* fire-and-forget */});

      // Record what we replied with
      await msg.update({ repliedWith: reply });
    }
  } catch (err: any) {
    // Unique constraint violation = duplicate webhook delivery — silently ignore
    if (err?.name === 'SequelizeUniqueConstraintError') return;
    console.error('[Webhook] Error processing WhatsApp message:', err);
  }
});

export default router;
