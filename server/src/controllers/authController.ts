import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { authService } from '../services/authService';

/**
 * Handles user registration.
 * Validates input, calls authService.register, returns token and user profile.
 */
export async function register(req: Request, res: Response): Promise<void> {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  try {
    const { name, email, phone, password } = req.body;
    const result = await authService.register({ name, email, phone, password });
    res.status(201).json(result);
  } catch (error: any) {
    if (error.message === 'A user with this email already exists') {
      res.status(409).json({ error: error.message });
      return;
    }
    if (
      error.message.includes('Phone must be') ||
      error.message.includes('Password must be')
    ) {
      res.status(400).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Registration failed' });
  }
}

/**
 * Handles user login.
 * Validates input, calls authService.login, returns token and user profile.
 */
export async function login(req: Request, res: Response): Promise<void> {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  try {
    const { email, password } = req.body;
    const result = await authService.login({ email, password });
    res.json(result);
  } catch (error: any) {
    if (error.message === 'User not found') {
      res.status(404).json({ error: error.message });
      return;
    }
    if (error.message === 'Invalid credentials') {
      res.status(401).json({ error: error.message });
      return;
    }
    if (error.message === 'Account is deactivated') {
      res.status(403).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Login failed' });
  }
}

/**
 * POST /api/auth/delivery-login
 * Email + password login for delivery boys only.
 */
export async function deliveryAuthLogin(req: Request, res: Response): Promise<void> {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  try {
    const { email, password } = req.body;
    const result = await authService.deliveryLogin({ email, password });
    res.json(result);
  } catch (error: any) {
    if (error.message === 'User not found' || error.message === 'Invalid credentials') {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }
    if (error.message === 'Account is deactivated') {
      res.status(403).json({ error: error.message });
      return;
    }
    if (error.message.startsWith('Access denied')) {
      res.status(403).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Login failed' });
  }
}

/**
 * Handles Google OAuth sign-in.
 * Accepts the Google credential (ID token) from the client,
 * verifies it, finds or creates the user, and returns a JWT.
 */
export async function googleAuth(req: Request, res: Response): Promise<void> {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  try {
    const { credential } = req.body;
    const result = await authService.googleLogin(credential);
    res.json(result);
  } catch (error: any) {
    if (error.message === 'Account is deactivated') {
      res.status(403).json({ error: error.message });
      return;
    }
    if (
      error.message === 'Invalid Google token' ||
      error.message === 'Google OAuth is not configured on the server'
    ) {
      res.status(400).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Google sign-in failed' });
  }
}
