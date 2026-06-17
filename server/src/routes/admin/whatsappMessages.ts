import { Router, Request, Response } from 'express';
import { auth } from '../../middleware/auth';
import { adminAuth } from '../../middleware/adminAuth';
import { WhatsAppMessage } from '../../models/WhatsAppMessage';
import { Op } from 'sequelize';

const router = Router();
router.use(auth, adminAuth);

/**
 * GET /api/admin/whatsapp/messages
 * Returns paginated incoming WhatsApp messages (newest first).
 * Query params: page, limit, unreadOnly
 */
router.get('/messages', async (req: Request, res: Response) => {
  const page       = Math.max(1, Number(req.query.page)  || 1);
  const limit      = Math.min(100, Number(req.query.limit) || 20);
  const unreadOnly = req.query.unreadOnly === 'true';
  const offset     = (page - 1) * limit;

  const where: any = {};
  if (unreadOnly) where.isRead = false;

  const { rows, count } = await WhatsAppMessage.findAndCountAll({
    where,
    order: [['createdAt', 'DESC']],
    limit,
    offset,
  });

  res.json({
    data: rows,
    total: count,
    page,
    totalPages: Math.ceil(count / limit),
    unread: await WhatsAppMessage.count({ where: { isRead: false } }),
  });
});

/**
 * PATCH /api/admin/whatsapp/messages/:id/read
 * Marks a message as read.
 */
router.patch('/messages/:id/read', async (req: Request, res: Response) => {
  const msg = await WhatsAppMessage.findByPk(req.params.id);
  if (!msg) { res.status(404).json({ error: 'Message not found' }); return; }
  await msg.update({ isRead: true });
  res.json(msg);
});

/**
 * PATCH /api/admin/whatsapp/messages/read-all
 * Marks all messages as read.
 */
router.patch('/messages/read-all', async (_req: Request, res: Response) => {
  await WhatsAppMessage.update({ isRead: true }, { where: { isRead: false } });
  res.json({ ok: true });
});

export default router;
