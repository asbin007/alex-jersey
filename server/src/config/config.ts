import dotenv from 'dotenv';

dotenv.config();

export const envConfig = {
  port: process.env.PORT,
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpireIn: process.env.JWT_EXPIRE_IN || '24h',
  clientUrl: process.env.CLIENT_URL,
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  },
  // Nodemailer / Gmail app credentials (for sending emails)
  email: {
    user: process.env.EMAIL || '',
    password: process.env.EMAIL_PASSWORD || '',
  },
  // Google OAuth (for client-side sign-in verification)
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  whatsappBusinessNumber: process.env.WHATSAPP_BUSINESS_NUMBER || '',
  admin: {
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
    username: process.env.ADMIN_USERNAME,
  },
};
