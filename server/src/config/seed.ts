import bcrypt from 'bcrypt';
import { sequelize } from './db';
import {
  User,
  Product,
  SizeStock,
  Review,
  Order,
  OrderItem,
  StatusHistoryEntry,
} from '../models/associations';

const SALT_ROUNDS = 12;

export async function seedDatabase() {
  const transaction = await sequelize.transaction();
  try {
    // 1. Check if products already exist
    const productCount = await Product.count({ transaction });
    if (productCount > 0) {
      console.log('Database already populated. Skipping seeding.');
      await transaction.commit();
      return;
    }

    console.log('Seeding database with mock data...');

    // 2. Create Default Users
    const hashedPassword = await bcrypt.hash('password123', SALT_ROUNDS);

    // Default Customer 1
    const customerUser = await User.create(
      {
        name: 'Aarav Sharma',
        email: 'aarav@example.com',
        phone: '9841234567',
        passwordHash: hashedPassword,
        role: 'customer',
        street: 'Thamel, Ward 26',
        city: 'Kathmandu',
        district: 'Kathmandu',
        isActive: true,
      },
      { transaction }
    );

    // Default Customer 2
    const customerUser2 = await User.create(
      {
        name: 'Bibek Basnet',
        email: 'bibek@example.com',
        phone: '9842234567',
        passwordHash: hashedPassword,
        role: 'customer',
        street: 'Baneshwor',
        city: 'Kathmandu',
        district: 'Kathmandu',
        isActive: true,
      },
      { transaction }
    );

    // Default Customer 3
    const customerUser3 = await User.create(
      {
        name: 'Sujata Thapa',
        email: 'sujata@example.com',
        phone: '9843234567',
        passwordHash: hashedPassword,
        role: 'customer',
        street: 'Lalitpur Ward 4',
        city: 'Lalitpur',
        district: 'Lalitpur',
        isActive: true,
      },
      { transaction }
    );

    // Default Admin
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@jerseystore.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'password123';
    const adminUsername = process.env.ADMIN_USERNAME || 'Admin User';
    
    const hashedAdminPassword = await bcrypt.hash(adminPassword, SALT_ROUNDS);

    await User.create(
      {
        name: adminUsername,
        email: adminEmail,
        phone: '9800000000',
        passwordHash: hashedAdminPassword,
        role: 'admin',
        street: 'Main Street',
        city: 'Kathmandu',
        district: 'Kathmandu',
        isActive: true,
      },
      { transaction }
    );

    // Removed mock products, sizes, reviews, and orders.

    await transaction.commit();
    console.log('Database seeded successfully!');
  } catch (error) {
    await transaction.rollback();
    console.error('Error seeding database:', error);
    throw error;
  }
}
