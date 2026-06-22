import { User } from './User';
import { Product } from './Product';
import { SizeStock } from './SizeStock';
import { Order } from './Order';
import { OrderItem } from './OrderItem';
import { StatusHistoryEntry } from './StatusHistoryEntry';
import { Review } from './Review';
import { WhatsAppMessage } from './WhatsAppMessage';
import { Wishlist } from './Wishlist';

// User <-> Order (customer)
User.hasMany(Order, { foreignKey: 'userId', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User <-> Order (delivery boy)
User.hasMany(Order, { foreignKey: 'deliveryBoyId', as: 'deliveries' });
Order.belongsTo(User, { foreignKey: 'deliveryBoyId', as: 'deliveryBoy' });

// User <-> Review
User.hasMany(Review, { foreignKey: 'userId', as: 'reviews' });
Review.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Product <-> SizeStock
Product.hasMany(SizeStock, { foreignKey: 'productId', as: 'sizes', onDelete: 'CASCADE' });
SizeStock.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// Product <-> OrderItem
Product.hasMany(OrderItem, { foreignKey: 'productId', as: 'orderItems' });
OrderItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// Product <-> Review
Product.hasMany(Review, { foreignKey: 'productId', as: 'productReviews', onDelete: 'CASCADE' });
Review.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// User <-> Wishlist
User.hasMany(Wishlist, { foreignKey: 'userId', as: 'wishlistItems' });
Wishlist.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Product <-> Wishlist
Product.hasMany(Wishlist, { foreignKey: 'productId', as: 'wishlistEntries' });
Wishlist.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// Order <-> OrderItem
Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items', onDelete: 'CASCADE' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

// Order <-> StatusHistoryEntry
Order.hasMany(StatusHistoryEntry, { foreignKey: 'orderId', as: 'statusHistory', onDelete: 'CASCADE' });
StatusHistoryEntry.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

export {
  User,
  Product,
  SizeStock,
  Order,
  OrderItem,
  StatusHistoryEntry,
  Review,
  WhatsAppMessage,
  Wishlist,
};
