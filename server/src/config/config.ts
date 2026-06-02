import dotenv from 'dotenv';

dotenv.config();

export const envConfig = {
  port: process.env.PORT || 5000,
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/nepal-jersey',
  jwtSecret: process.env.JWT_SECRET || 'default_jwt_secret',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  },
  whatsappBusinessNumber: process.env.WHATSAPP_BUSINESS_NUMBER || '',
};
