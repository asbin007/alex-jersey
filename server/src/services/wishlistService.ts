import { Wishlist } from '../models/Wishlist';
import { Product, SizeStock } from '../models/associations';

export async function getWishlist(userId: string): Promise<any[]> {
  const items = await Wishlist.findAll({
    where: { userId },
    include: [{ model: Product, as: 'product', include: [{ model: SizeStock, as: 'sizes' }] }],
    order: [['createdAt', 'DESC']],
  });
  return items.map((item: any) => item.product).filter(Boolean);
}

export async function addToWishlist(userId: string, productId: string): Promise<boolean> {
  const [_, created] = await Wishlist.findOrCreate({
    where: { userId, productId },
    defaults: { userId, productId },
  });
  return created;
}

export async function removeFromWishlist(userId: string, productId: string): Promise<boolean> {
  const deleted = await Wishlist.destroy({ where: { userId, productId } });
  return deleted > 0;
}

export async function isInWishlist(userId: string, productId: string): Promise<boolean> {
  const item = await Wishlist.findOne({ where: { userId, productId } });
  return !!item;
}
