import 'dotenv/config';
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:3001',
  'https://alexjersey.rocks',
  'https://www.alexjersey.rocks',
  'https://admin.alexjersey.rocks',
  'https://www.admin.alexjersey.rocks',
  process.env.CLIENT_URL,
  process.env.ADMIN_URL,
].filter(Boolean) as string[];

const allowedPatterns = [
  /^https:\/\/.*\.vercel\.app$/,
  /^https:\/\/.*\.onrender\.com$/,
];

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    if (allowedPatterns.some((p) => p.test(origin))) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
import authRoutes from './routes/auth';
import productRoutes from './routes/products';
import orderRoutes from './routes/orders';
import deliveryRoutes from './routes/delivery';
import adminProductRoutes from './routes/admin/products';
import adminOrderRoutes from './routes/admin/orders';
import adminUploadRoutes from './routes/admin/upload';
import reviewRoutes from './routes/reviews';
import adminReviewRoutes from './routes/admin/reviews';
import adminDashboardRoutes from './routes/admin/dashboard';
import adminUserRoutes from './routes/admin/users';
import adminDeliveryRoutes from './routes/admin/delivery';
import adminWhatsAppRoutes from './routes/admin/whatsapp';
import adminWhatsAppMessagesRoutes from './routes/admin/whatsappMessages';
import whatsappWebhookRoutes from './routes/webhooks/whatsapp';
import { getSitemap } from './controllers/seoController';

// ── Health check routes ───────────────────────────────────────────────────────
// /health  — Render's default health-check path (must return 2xx quickly,
//             before the DB is ready, so that Render can wake the service)
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// /api/health — legacy / client-facing alias
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Nepal Jersey API is running' });
});

// Sitemap
app.get('/sitemap.xml', getSitemap);

// Auth routes
app.use('/api/auth', authRoutes);

// Product routes
app.use('/api/products', productRoutes);
app.use('/api/admin/products', adminProductRoutes);
app.use('/api/admin/upload', adminUploadRoutes);

// Order routes
app.use('/api/orders', orderRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/admin/orders', adminOrderRoutes);
app.use('/api/admin/dashboard', adminDashboardRoutes);
app.use('/api/admin/users', adminUserRoutes);
app.use('/api/admin/delivery-boys', adminDeliveryRoutes);
app.use('/api/admin/whatsapp', adminWhatsAppRoutes);
app.use('/api/admin/whatsapp', adminWhatsAppMessagesRoutes);

// WAHA webhook — no auth (WAHA posts here directly)
app.use('/api/webhooks/whatsapp', whatsappWebhookRoutes);

// Review routes
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin/reviews', adminReviewRoutes);

// Global error handler — must be after all routes, keeps CORS headers intact
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

import { sequelize } from './config/db';
import './models/associations';
import { seedDatabase } from './config/seed';
import { User } from './models/User';
import bcrypt from 'bcrypt';
import { envConfig } from './config/config';

// ── WAHA configuration warning (logged at startup, never blocks boot) ─────────
function warnWahaConfig(): void {
  const wahaUrl = process.env.WAHA_URL;
  if (!wahaUrl) {
    console.warn(
      '[WAHA] WARNING: WAHA_URL is not set. WhatsApp notifications will be skipped. ' +
      'Set WAHA_URL to your deployed WAHA service URL (e.g. https://waha.yourservice.onrender.com).'
    );
    return;
  }
  if (
    process.env.NODE_ENV === 'production' &&
    (wahaUrl.includes('localhost') || wahaUrl.includes('127.0.0.1'))
  ) {
    console.warn(
      `[WAHA] WARNING: WAHA_URL is set to "${wahaUrl}" which is a localhost address. ` +
      `This will cause ECONNREFUSED errors in production. ` +
      `Update WAHA_URL to the external URL of your deployed WAHA container.`
    );
    return;
  }
  console.log(`[WAHA] Configured — WAHA_URL=${wahaUrl}  SESSION=${process.env.WAHA_SESSION || 'default'}`);
}

async function startServer() {
  try {
    // Log WAHA config before anything else so it's easy to spot in Render logs
    warnWahaConfig();

    await sequelize.authenticate();
    console.log('Connected to Neon Database (PostgreSQL) via Sequelize');

    // alter:true adds missing columns (e.g. googleId) without dropping existing data
    await sequelize.sync({ alter: true });
    console.log('Database synchronized');

    // Seed database dynamically if it is empty
    await seedDatabase();

    // Ensure the ENV admin exists or is updated
    const adminEmail = envConfig.admin.email;
    const adminPassword = envConfig.admin.password;
    const adminUsername = envConfig.admin.username;

    const existingAdmin = await User.findOne({ where: { email: adminEmail } });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(adminPassword as string, 12);
      await User.create({
        name: adminUsername,
        email: adminEmail,
        phone: process.env.ADMIN_PHONE || '9800000000',
        passwordHash: hashedPassword,
        role: 'admin',
        isActive: true,
      });
      console.log(`Default env admin seeded with email: ${adminEmail}`);
    }

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Database connection or synchronization error:', error);
    process.exit(1);
  }
}

startServer();

export default app;
