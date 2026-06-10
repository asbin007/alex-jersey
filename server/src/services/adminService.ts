import { Op } from 'sequelize';
import { User, Product, Order, OrderItem } from '../models/associations';

export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalUsers: number;
  pendingOrders: number;
  recentOrders: any[];
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const [totalOrders, totalProducts, totalUsers, pendingOrders, recentOrders, totalRevenue] =
    await Promise.all([
      Order.count(),
      Product.count({ where: { isActive: true } }),
      User.count(),
      Order.count({ where: { status: 'pending' } }),
      Order.findAll({
        order: [['createdAt', 'DESC']],
        limit: 5,
        include: [
          {
            model: OrderItem,
            as: 'items',
            include: [{ model: Product, as: 'product', attributes: ['name', 'slug', 'images', 'price'] }],
          },
        ],
      }),
      Order.sum('total', {
        where: {
          status: { [Op.ne]: 'cancelled' },
        },
      }),
    ]);

  return {
    totalOrders,
    totalRevenue: totalRevenue || 0,
    totalProducts,
    totalUsers,
    pendingOrders,
    recentOrders,
  };
}

export async function getAllUsers(): Promise<any[]> {
  return User.findAll({
    attributes: { exclude: ['passwordHash'] },
    order: [['createdAt', 'DESC']],
  });
}

export async function updateUserRole(
  userId: string,
  role: 'customer' | 'admin' | 'delivery_boy'
): Promise<any | null> {
  const user = await User.findByPk(userId);
  if (!user) return null;
  await user.update({ role });
  return User.findByPk(userId, { attributes: { exclude: ['passwordHash'] } });
}

/**
 * Create a delivery boy account (admin only).
 * Returns the new user and their plain-text password for admin to share.
 */
export async function createDeliveryBoy(data: {
  name: string;
  email: string;
  phone: string;
  password: string;
}): Promise<{ user: any; plainPassword: string }> {
  const bcrypt = await import('bcrypt');
  const existing = await User.findOne({ where: { email: data.email.toLowerCase() } });
  if (existing) throw new Error('A user with this email already exists');

  const passwordHash = await bcrypt.hash(data.password, 12);
  const user = await User.create({
    name: data.name,
    email: data.email.toLowerCase(),
    phone: data.phone,
    passwordHash,
    role: 'delivery_boy',
    isActive: true,
  });

  const plain = await User.findByPk(user.id, { attributes: { exclude: ['passwordHash'] } });
  return { user: plain, plainPassword: data.password };
}

/**
 * Delete a delivery boy account.
 */
export async function deleteDeliveryBoy(userId: string): Promise<boolean> {
  const user = await User.findByPk(userId);
  if (!user || user.role !== 'delivery_boy') return false;
  await user.destroy();
  return true;
}

/**
 * Get all delivery boys.
 */
export async function getDeliveryBoys(): Promise<any[]> {
  return User.findAll({
    where: { role: 'delivery_boy' },
    attributes: { exclude: ['passwordHash'] },
    order: [['createdAt', 'DESC']],
  });
}
