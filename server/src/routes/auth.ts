import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, googleAuth, deliveryAuthLogin } from '../controllers/authController';

const router = Router();

/**
 * Validation rules for registration.
 * - name: non-empty, trimmed
 * - email: valid email format
 * - phone: 10 digits starting with 97 or 98 (Nepal format)
 * - password: minimum 8 characters with at least one number
 */
const registerValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('phone')
    .matches(/^(97|98)\d{8}$/)
    .withMessage('Phone must be a valid Nepal number (10 digits starting with 97 or 98)'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/\d/)
    .withMessage('Password must contain at least one number'),
];

/**
 * Validation rules for login.
 * - email: valid email format
 * - password: non-empty
 */
const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

// POST /api/auth/register
router.post('/register', registerValidation, register);

// POST /api/auth/login
router.post('/login', loginValidation, login);

// POST /api/auth/google
// Accepts a Google ID token from the client, verifies it, and returns a JWT
router.post(
  '/google',
  body('credential').notEmpty().withMessage('Google credential is required'),
  googleAuth
);

// POST /api/auth/delivery-login — email+password for delivery boys
router.post(
  '/delivery-login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  deliveryAuthLogin
);

export default router;
