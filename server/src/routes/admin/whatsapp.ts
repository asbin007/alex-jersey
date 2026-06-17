import { Router, Request, Response } from 'express';
import { auth } from '../../middleware/auth';
import { adminAuth } from '../../middleware/adminAuth';

const router = Router();
router.use(auth, adminAuth);

const WAHA_URL     = process.env.WAHA_URL     || 'http://localhost:3000';
const WAHA_API_KEY = process.env.WAHA_API_KEY || '';
const SESSION      = process.env.WAHA_SESSION || 'default';

/**
 * GET /api/admin/whatsapp/status
 * Proxies a status check to the local WAHA container and returns
 * a simplified payload the admin dashboard can render.
 */
router.get('/status', async (_req: Request, res: Response) => {
  try {
    const response = await fetch(`${WAHA_URL}/api/sessions/${SESSION}`, {
      headers: { 'X-Api-Key': WAHA_API_KEY },
    });

    if (!response.ok) {
      res.json({ connected: false, status: 'UNAVAILABLE', session: SESSION });
      return;
    }

    const data: any = await response.json();
    const status: string = data.status ?? 'UNKNOWN';

    res.json({
      connected: status === 'WORKING',
      status,                          // WORKING | STARTING | STOPPED | FAILED | SCAN_QR_CODE
      session: SESSION,
      wahaUrl: WAHA_URL,
      me: data.me ?? null,             // { id, pushName } when connected
    });
  } catch {
    res.json({ connected: false, status: 'UNAVAILABLE', session: SESSION });
  }
});

export default router;
