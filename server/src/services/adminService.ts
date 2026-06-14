import { Op } from 'sequelize';
import { User, Product, Order, OrderItem, SizeStock } from '../models/associations';

export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalUsers: number;
  pendingOrders: number;
  recentOrders: any[];
  todayOrders: number;
  todayRevenue: number;
  yesterdayRevenue: number;
  unassignedOrders: number;
  statusBreakdown: Record<string, number>;
  dailyRevenue: { date: string; revenue: number; orders: number }[];
  lowStockProducts: { id: string; name: string; sizes: { size: string; stock: number }[] }[];
  topProducts: { productId: string; productName: string; totalSold: number; totalRevenue: number }[];
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart.getTime() - 86400000);
  const sevenDaysAgo = new Date(todayStart.getTime() - 6 * 86400000);

  const [
    totalOrders,
    totalProducts,
    totalUsers,
    pendingOrders,
    recentOrders,
    totalRevenue,
    todayOrders,
    todayRevenue,
    yesterdayRevenue,
    unassignedOrders,
    allStatuses,
    last7DaysOrders,
    lowStockItems,
    topItems,
  ] = await Promise.all([
    Order.count(),
    Product.count({ where: { isActive: true } }),
    User.count(),
    Order.count({ where: { status: 'pending' } }),
    Order.findAll({
      order: [['createdAt', 'DESC']],
      limit: 5,
      include: [{ model: OrderItem, as: 'items' }],
    }),
    Order.sum('total', { where: { status: { [Op.ne]: 'cancelled' } } }),
    Order.count({ where: { createdAt: { [Op.gte]: todayStart } } }),
    Order.sum('total', {
      where: { createdAt: { [Op.gte]: todayStart }, status: { [Op.ne]: 'cancelled' } },
    }),
    Order.sum('total', {
      where: {
        createdAt: { [Op.gte]: yesterdayStart, [Op.lt]: todayStart },
        status: { [Op.ne]: 'cancelled' },
      },
    }),
    Order.count({ where: { deliveryBoyId: null, status: { [Op.notIn]: ['delivered', 'cancelled'] } } }),
    Order.findAll({
      attributes: ['status'],
      where: { status: { [Op.ne]: 'cancelled' } },
    }),
    Order.findAll({
      where: { createdAt: { [Op.gte]: sevenDaysAgo }, status: { [Op.ne]: 'cancelled' } },
      attributes: ['createdAt', 'total'],
    }),
    SizeStock.findAll({
      where: { stock: { [Op.lte]: 3 } },
      include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'isActive'], where: { isActive: true } }],
      order: [['stock', 'ASC']],
      limit: 6,
    }),
    OrderItem.findAll({
      attributes: ['productId', 'productName', 'quantity', 'price'],
      include: [{ model: Order, as: 'order', attributes: [], where: { status: { [Op.ne]: 'cancelled' } } }],
    }),
  ]);

  // Status breakdown
  const statusBreakdown: Record<string, number> = {};
  for (const o of allStatuses as any[]) {
    const s = o.status as string;
    statusBreakdown[s] = (statusBreakdown[s] || 0) + 1;
  }

  // Daily revenue for last 7 days
  const dailyMap: Record<string, { revenue: number; orders: number }> = {};
  for (let i = 0; i < 7; i++) {
    const d = new Date(sevenDaysAgo.getTime() + i * 86400000);
    const key = d.toISOString().slice(0, 10);
    dailyMap[key] = { revenue: 0, orders: 0 };
  }
  for (const o of last7DaysOrders as any[]) {
    const key = new Date(o.createdAt).toISOString().slice(0, 10);
    if (dailyMap[key]) {
      dailyMap[key].revenue += Number(o.total) || 0;
      dailyMap[key].orders += 1;
    }
  }
  const dailyRevenue = Object.entries(dailyMap).map(([date, v]) => ({ date, ...v }));

  // Low stock products
  const lowStockMap: Record<string, { id: string; name: string; sizes: { size: string; stock: number }[] }> = {};
  for (const s of lowStockItems as any[]) {
    const pid = s.product?.id || s.productId;
    const name = s.product?.name || 'Unknown';
    if (!lowStockMap[pid]) lowStockMap[pid] = { id: pid, name, sizes: [] };
    lowStockMap[pid].sizes.push({ size: s.size, stock: s.stock });
  }
  const lowStockProducts = Object.values(lowStockMap);

  // Top selling products
  const topMap: Record<string, { productId: string; productName: string; totalSold: number; totalRevenue: number }> = {};
  for (const item of topItems as any[]) {
    const pid = item.productId;
    if (!topMap[pid]) topMap[pid] = { productId: pid, productName: item.productName, totalSold: 0, totalRevenue: 0 };
    topMap[pid].totalSold += Number(item.quantity) || 0;
    topMap[pid].totalRevenue += Number(item.price) || 0;
  }
  const topProducts = Object.values(topMap)
    .sort((a, b) => b.totalSold - a.totalSold)
    .slice(0, 5);

  return {
    totalOrders,
    totalRevenue: totalRevenue || 0,
    totalProducts,
    totalUsers,
    pendingOrders,
    recentOrders,
    todayOrders,
    todayRevenue: todayRevenue || 0,
    yesterdayRevenue: yesterdayRevenue || 0,
    unassignedOrders,
    statusBreakdown,
    dailyRevenue,
    lowStockProducts,
    topProducts,
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
