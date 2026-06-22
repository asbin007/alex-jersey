import { Router } from 'express';
import { auth } from '../middleware/auth';
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  checkWishlist,
} from '../controllers/wishlistController';

const router = Router();

router.use(auth);

router.get('/', getWishlist);
router.get('/:productId', checkWishlist);
router.post('/:productId', addToWishlist);
router.delete('/:productId', removeFromWishlist);

export default router;
