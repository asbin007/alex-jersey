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

// Health check route
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Nepal Jersey API is running' });
});

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

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('Connected to Neon Database (PostgreSQL) via Sequelize');
    
    // alter:true adds missing columns (e.g. googleId) without dropping existing data
    await sequelize.sync({ alter: true });
    console.log('Database synchronized');

    // Seed database dynamically if it is empty
    await seedDatabase();

    // Ensure the ENV admin exists or is updated
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@gmail.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    
    const existingAdmin = await User.findOne({ where: { email: adminEmail } });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(adminPassword, 12);
      await User.create({
        name: adminUsername,
        email: adminEmail,
        phone: '9800000000',
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
