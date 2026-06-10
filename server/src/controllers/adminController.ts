import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import * as adminService from '../services/adminService';

export async function getDashboardStats(req: Request, res: Response): Promise<void> {
  try {
    const stats = await adminService.getDashboardStats();
    res.json(stats);
  } catch {
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
}

export async function getAllUsers(req: Request, res: Response): Promise<void> {
  try {
    const users = await adminService.getAllUsers();
    res.json(users);
  } catch {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
}

export async function updateUserRole(req: Request, res: Response): Promise<void> {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  try {
    const user = await adminService.updateUserRole(req.params.id, req.body.role);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json(user);
  } catch {
    res.status(500).json({ error: 'Failed to update user role' });
  }
}
