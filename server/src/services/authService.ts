import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { envConfig } from '../config/config';
import { RegisterDTO, LoginDTO, AuthResponse, DecodedToken } from '../types/dto';

const SALT_ROUNDS = 12;
const TOKEN_EXPIRY = '24h';

/**
 * Validates password meets policy: minimum 8 characters with at least one number.
 */
function validatePassword(password: string): boolean {
  return password.length >= 8 && /\d/.test(password);
}

/**
 * Validates Nepal phone format: 10 digits starting with 97 or 98.
 */
function validatePhone(phone: string): boolean {
  return /^(97|98)\d{8}$/.test(phone);
}

/**
 * Generates a JWT token containing userId and role with 24-hour expiry.
 */
function generateToken(userId: string, role: 'customer' | 'admin'): string {
  return jwt.sign({ userId, role }, envConfig.jwtSecret, {
    expiresIn: TOKEN_EXPIRY,
  });
}

/**
 * Registers a new user account.
 * Validates inputs, hashes password, creates user, returns token + user profile.
 */
async function register(data: RegisterDTO): Promise<AuthResponse> {
  const { name, email, phone, password } = data;

  // Validate phone format
  if (!validatePhone(phone)) {
    throw new Error('Phone must be a valid Nepal number (10 digits starting with 97 or 98)');
  }

  // Validate password policy
  if (!validatePassword(password)) {
    throw new Error('Password must be at least 8 characters with at least one number');
  }

  // Check if email already exists
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new Error('A user with this email already exists');
  }

  // Hash password with bcrypt salt rounds of 12
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  // Create user
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    phone,
    passwordHash,
    role: 'customer',
    isActive: true,
  });

  // Generate JWT token
  const token = generateToken(user._id.toString(), user.role);

  return {
    token,
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
  };
}

/**
 * Authenticates a user with email and password.
 * Finds user by email, compares password, returns token + user profile.
 */
async function login(credentials: LoginDTO): Promise<AuthResponse> {
  const { email, password } = credentials;

  // Find user by email
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    throw new Error('User not found');
  }

  // Check if user is active
  if (!user.isActive) {
    throw new Error('Account is deactivated');
  }

  // Compare password
  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new Error('Invalid credentials');
  }

  // Generate JWT token
  const token = generateToken(user._id.toString(), user.role);

  return {
    token,
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
  };
}

/**
 * Verifies and decodes a JWT token.
 * Returns the decoded token payload with userId and role.
 */
function verifyToken(token: string): DecodedToken {
  try {
    const decoded = jwt.verify(token, envConfig.jwtSecret) as DecodedToken;
    return decoded;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

export const authService = {
  register,
  login,
  verifyToken,
};
