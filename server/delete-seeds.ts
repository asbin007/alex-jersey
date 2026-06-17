import 'dotenv/config';
import { sequelize } from './src/config/db';
import { Product, SizeStock, Review, Order, OrderItem, StatusHistoryEntry } from './src/models/associations';

async function deleteSeeds() {
  try {
    await sequelize.authenticate();
    console.log('Connected to database. Deleting seeded products and related data...');
    
    await StatusHistoryEntry.destroy({ where: {} });
    await OrderItem.destroy({ where: {} });
    await Order.destroy({ where: {} });
    await Review.destroy({ where: {} });
    await SizeStock.destroy({ where: {} });
    await Product.destroy({ where: {} });
    
    console.log('Successfully deleted all products, orders, and reviews from the database.');
    process.exit(0);
  } catch (error) {
    console.error('Error deleting data:', error);
    process.exit(1);
  }
}

deleteSeeds();
