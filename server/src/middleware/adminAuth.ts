import { Request, Response, NextFunction } from 'express';

/**
 * Admin authorization middleware.
 * Must be used after auth middleware.
 * Checks that the authenticated user has admin role.
 */
export function adminAuth(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  if (req.user.role !== 'admin') {
    res.status(403).json({ error: 'Admin access required' });
    return;
  }

  next();
}

export default adminAuth;
