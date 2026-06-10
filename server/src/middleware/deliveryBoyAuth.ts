import { Request, Response, NextFunction } from 'express';

/**
 * Delivery boy authorization middleware.
 * Must be used after auth middleware.
 * Allows access to users with 'admin' or 'delivery_boy' role.
 */
export function deliveryBoyAuth(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  if (req.user.role !== 'delivery_boy' && req.user.role !== 'admin') {
    res.status(403).json({ error: 'Delivery access required' });
    return;
  }

  next();
}

export default deliveryBoyAuth;
