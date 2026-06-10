import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import * as adminService from '../services/adminService';

export async function getDeliveryBoysHandler(req: Request, res: Response): Promise<void> {
  try {
    const boys = await adminService.getDeliveryBoys();
    res.json(boys);
  } catch {
    res.status(500).json({ error: 'Failed to fetch delivery boys' });
  }
}

export async function createDeliveryBoyHandler(req: Request, res: Response): Promise<void> {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  try {
    const { name, email, phone, password } = req.body;
    const result = await adminService.createDeliveryBoy({ name, email, phone, password });
    res.status(201).json(result);
  } catch (error: any) {
    if (error.message === 'A user with this email already exists') {
      res.status(409).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Failed to create delivery boy' });
  }
}

export async function deleteDeliveryBoyHandler(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const deleted = await adminService.deleteDeliveryBoy(id);
    if (!deleted) {
      res.status(404).json({ error: 'Delivery boy not found' });
      return;
    }
    res.json({ message: 'Deleted successfully' });
  } catch {
    res.status(500).json({ error: 'Failed to delete delivery boy' });
  }
}
