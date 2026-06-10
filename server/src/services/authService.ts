import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
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
function generateToken(userId: string, role: 'customer' | 'admin' | 'delivery_boy'): string {
  const secret = envConfig.jwtSecret;
  if (!secret) throw new Error('JWT secret is not configured');
  return jwt.sign({ userId, role }, secret, { expiresIn: TOKEN_EXPIRY });
}

/**
 * Registers a new user account.
 * Validates inputs, hashes password, creates user, returns token + user profile.
 */
async function register(data: RegisterDTO): Promise<AuthResponse> {
  const { name, email, phone, password } = data;

  if (!validatePhone(phone)) {
    throw new Error('Phone must be a valid Nepal number (10 digits starting with 97 or 98)');
  }

  if (!validatePassword(password)) {
    throw new Error('Password must be at least 8 characters with at least one number');
  }

  const existingUser = await User.findOne({ where: { email: email.toLowerCase() } });
  if (existingUser) {
    throw new Error('A user with this email already exists');
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    phone,
    passwordHash,
    role: 'customer',
    isActive: true,
  });

  const token = generateToken(user.id, user.role);

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone ?? '',
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

  const user = await User.findOne({ where: { email: email.toLowerCase() } });
  if (!user) throw new Error('User not found');

  if (!user.isActive) throw new Error('Account is deactivated');

  if (!user.passwordHash) {
    // Account registered via Google — no password set
    throw new Error('This account uses Google sign-in. Please sign in with Google.');
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) throw new Error('Invalid credentials');

  const token = generateToken(user.id, user.role);

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone ?? '',
      role: user.role,
    },
  };
}

/**
 * Authenticate or register a user via Google OAuth access token.
 * Fetches user info from Google, finds or creates the user, and returns a JWT.
 */
async function googleLogin(accessToken: string): Promise<AuthResponse> {
  // Fetch user profile from Google using the access token
  const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    throw new Error('Invalid Google token');
  }

  const profile = await res.json() as {
    sub: string;
    email: string;
    name: string;
    picture?: string;
  };

  if (!profile.email) {
    throw new Error('Invalid Google token');
  }

  const { sub: googleId, email, name, picture } = profile;

  let user = await User.findOne({ where: { email: email.toLowerCase() } });

  if (user) {
    if (!user.googleId) {
      await user.update({ googleId, avatar: user.avatar || picture || null });
    }
    if (!user.isActive) throw new Error('Account is deactivated');
  } else {
    user = await User.create({
      name: name || email.split('@')[0],
      email: email.toLowerCase(),
      phone: null,
      passwordHash: null,
      googleId,
      avatar: picture || null,
      role: 'customer',
      isActive: true,
    });
  }

  const token = generateToken(user.id, user.role);

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone ?? '',
      role: user.role,
    },
  };
}

/**
 * Verifies and decodes a JWT token.
 */
function verifyToken(token: string): DecodedToken {
  const secret = envConfig.jwtSecret;
  if (!secret) throw new Error('JWT secret is not configured');
  try {
    return jwt.verify(token, secret) as unknown as DecodedToken;
  } catch {
    throw new Error('Invalid or expired token');
  }
}

/**
 * Login specifically for delivery boys — validates email+password,
 * checks role is delivery_boy or admin.
 */
async function deliveryLogin(credentials: LoginDTO): Promise<AuthResponse> {
  const { email, password } = credentials;

  const user = await User.findOne({ where: { email: email.toLowerCase() } });
  if (!user) throw new Error('User not found');
  if (!user.isActive) throw new Error('Account is deactivated');
  if (user.role !== 'delivery_boy' && user.role !== 'admin') {
    throw new Error('Access denied: delivery portal is for delivery staff only');
  }
  if (!user.passwordHash) throw new Error('Invalid credentials');

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new Error('Invalid credentials');

  const token = generateToken(user.id, user.role);
  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone ?? '',
      role: user.role,
    },
  };
}

export const authService = {
  register,
  login,
  googleLogin,
  deliveryLogin,
  verifyToken,
};
