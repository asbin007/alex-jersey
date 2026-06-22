import { Request, Response } from 'express';
import * as wishlistService from '../services/wishlistService';

export async function getWishlist(req: Request, res: Response): Promise<void> {
  try {
    const products = await wishlistService.getWishlist(req.user!.userId);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch wishlist' });
  }
}

export async function addToWishlist(req: Request, res: Response): Promise<void> {
  try {
    const { productId } = req.params;
    const created = await wishlistService.addToWishlist(req.user!.userId, productId);
    res.status(created ? 201 : 200).json({ added: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add to wishlist' });
  }
}

export async function removeFromWishlist(req: Request, res: Response): Promise<void> {
  try {
    const { productId } = req.params;
    await wishlistService.removeFromWishlist(req.user!.userId, productId);
    res.json({ added: false });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove from wishlist' });
  }
}

export async function checkWishlist(req: Request, res: Response): Promise<void> {
  try {
    const { productId } = req.params;
    const inWishlist = await wishlistService.isInWishlist(req.user!.userId, productId);
    res.json({ inWishlist });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check wishlist' });
  }
}
