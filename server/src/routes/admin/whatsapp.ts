import { Router, Request, Response } from 'express';
import { auth } from '../../middleware/auth';
import { adminAuth } from '../../middleware/adminAuth';

const router = Router();
router.use(auth, adminAuth);

const WAHA_URL     = process.env.WAHA_URL;
const WAHA_API_KEY = process.env.WAHA_API_KEY || '';
const SESSION      = process.env.WAHA_SESSION || 'default';

/**
 * GET /api/admin/whatsapp/status
 * Proxies a status check to the WAHA service and returns a simplified
 * payload the admin dashboard can render.
 *
 * If WAHA_URL is not configured or unreachable the endpoint always
 * returns HTTP 200 with { connected: false } so the dashboard degrades
 * gracefully instead of showing an error page.
 */
router.get('/status', async (_req: Request, res: Response) => {
  // Guard: WAHA_URL must be set and must not point to localhost in production
  if (!WAHA_URL) {
    console.warn('[WAHA] /status — WAHA_URL is not set');
    res.json({ connected: false, status: 'NOT_CONFIGURED', session: SESSION });
    return;
  }

  if (
    process.env.NODE_ENV === 'production' &&
    (WAHA_URL.includes('localhost') || WAHA_URL.includes('127.0.0.1'))
  ) {
    console.warn(`[WAHA] /status — WAHA_URL is a localhost address (${WAHA_URL}), unreachable in production`);
    res.json({ connected: false, status: 'MISCONFIGURED', session: SESSION, wahaUrl: WAHA_URL });
    return;
  }

  const url = `${WAHA_URL}/api/sessions/${SESSION}`;
  console.log(`[WAHA] → GET ${url}`);

  try {
    const response = await fetch(url, {
      headers: {
        ...(WAHA_API_KEY ? { 'X-Api-Key': WAHA_API_KEY } : {}),
      },
    });

    console.log(`[WAHA] ← ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const body = await response.text();
      console.error(`[WAHA] /status non-OK response: ${response.status}  body=${body.slice(0, 200)}`);
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
  } catch (err: any) {
    if (err?.code === 'ECONNREFUSED' || err?.cause?.code === 'ECONNREFUSED') {
      console.error(
        `[WAHA] ECONNREFUSED reaching ${url}. ` +
        `Ensure WAHA_URL is set to a reachable external URL, not localhost.`
      );
    } else if (err?.code === 'ETIMEDOUT' || err?.name === 'TimeoutError') {
      console.error(`[WAHA] ETIMEDOUT reaching ${url}.`);
    } else {
      console.error(`[WAHA] /status fetch error:`, err);
    }
    res.json({ connected: false, status: 'UNAVAILABLE', session: SESSION });
  }
});

export default router;
