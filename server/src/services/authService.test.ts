import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { authService } from './authService';
import { User } from '../models/User';
import { envConfig } from '../config/config';

// Mock dependencies
jest.mock('../models/User', () => ({
  User: {
    findOne: jest.fn(),
    create: jest.fn(),
  },
}));
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

const mockedUser = User as jest.Mocked<any>;
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;
const mockedJwt = jwt as jest.Mocked<typeof jwt>;

describe('authService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    const validRegisterData = {
      name: 'Aarav Sharma',
      email: 'aarav@example.com',
      phone: '9841234567',
      password: 'password123',
    };

    it('should register a user with valid data and return token + user profile', async () => {
      const mockCreatedUser = {
        id: 'user_id_123',
        name: 'Aarav Sharma',
        email: 'aarav@example.com',
        phone: '9841234567',
        role: 'customer',
        isActive: true,
        passwordHash: 'hashed_password',
      };

      mockedUser.findOne.mockResolvedValue(null);
      (mockedBcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
      mockedUser.create.mockResolvedValue(mockCreatedUser);
      (mockedJwt.sign as jest.Mock).mockReturnValue('mock_jwt_token');

      const result = await authService.register(validRegisterData);

      expect(result.token).toBe('mock_jwt_token');
      expect(result.user.id).toBe('user_id_123');
      expect(result.user.name).toBe('Aarav Sharma');
      expect(result.user.email).toBe('aarav@example.com');
      expect(result.user.phone).toBe('9841234567');
      expect(result.user.role).toBe('customer');
    });

    it('should hash password with bcrypt salt rounds of 12', async () => {
      mockedUser.findOne.mockResolvedValue(null);
      (mockedBcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
      mockedUser.create.mockResolvedValue({
        id: 'id123',
        name: 'Test',
        email: 'test@test.com',
        phone: '9841234567',
        role: 'customer',
      });
      (mockedJwt.sign as jest.Mock).mockReturnValue('token');

      await authService.register(validRegisterData);

      expect(mockedBcrypt.hash).toHaveBeenCalledWith('password123', 12);
    });

    it('should generate JWT with userId and role, expiring in 24h', async () => {
      mockedUser.findOne.mockResolvedValue(null);
      (mockedBcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
      mockedUser.create.mockResolvedValue({
        id: 'user_id_123',
        name: 'Test',
        email: 'test@test.com',
        phone: '9841234567',
        role: 'customer',
      });
      (mockedJwt.sign as jest.Mock).mockReturnValue('token');

      await authService.register(validRegisterData);

      expect(mockedJwt.sign).toHaveBeenCalledWith(
        { userId: 'user_id_123', role: 'customer' },
        envConfig.jwtSecret,
        { expiresIn: '24h' }
      );
    });

    it('should reject registration with invalid Nepal phone number', async () => {
      const invalidPhoneData = { ...validRegisterData, phone: '1234567890' };

      await expect(authService.register(invalidPhoneData)).rejects.toThrow(
        'Phone must be a valid Nepal number (10 digits starting with 97 or 98)'
      );
    });

    it('should reject registration with phone not starting with 97 or 98', async () => {
      const invalidPhoneData = { ...validRegisterData, phone: '9612345678' };

      await expect(authService.register(invalidPhoneData)).rejects.toThrow(
        'Phone must be a valid Nepal number (10 digits starting with 97 or 98)'
      );
    });

    it('should reject registration with password shorter than 8 characters', async () => {
      const shortPasswordData = { ...validRegisterData, password: 'pass1' };

      await expect(authService.register(shortPasswordData)).rejects.toThrow(
        'Password must be at least 8 characters with at least one number'
      );
    });

    it('should reject registration with password without a number', async () => {
      const noNumberPasswordData = { ...validRegisterData, password: 'passwordonly' };

      await expect(authService.register(noNumberPasswordData)).rejects.toThrow(
        'Password must be at least 8 characters with at least one number'
      );
    });

    it('should reject registration with duplicate email', async () => {
      mockedUser.findOne.mockResolvedValue({ email: 'aarav@example.com' });

      await expect(authService.register(validRegisterData)).rejects.toThrow(
        'A user with this email already exists'
      );
    });

    it('should normalize email to lowercase', async () => {
      const upperCaseEmailData = { ...validRegisterData, email: 'Aarav@Example.COM' };

      mockedUser.findOne.mockResolvedValue(null);
      (mockedBcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
      mockedUser.create.mockResolvedValue({
        id: 'id123',
        name: 'Aarav Sharma',
        email: 'aarav@example.com',
        phone: '9841234567',
        role: 'customer',
      });
      (mockedJwt.sign as jest.Mock).mockReturnValue('token');

      await authService.register(upperCaseEmailData);

      expect(mockedUser.findOne).toHaveBeenCalledWith({
        where: { email: 'aarav@example.com' },
      });
    });
  });

  describe('login', () => {
    const validLoginData = {
      email: 'aarav@example.com',
      password: 'password123',
    };

    it('should login with valid credentials and return token + user profile', async () => {
      const mockUser = {
        id: 'user_id_123',
        name: 'Aarav Sharma',
        email: 'aarav@example.com',
        phone: '9841234567',
        passwordHash: 'hashed_password',
        role: 'customer',
        isActive: true,
      };

      mockedUser.findOne.mockResolvedValue(mockUser);
      (mockedBcrypt.compare as jest.Mock).mockResolvedValue(true);
      (mockedJwt.sign as jest.Mock).mockReturnValue('mock_jwt_token');

      const result = await authService.login(validLoginData);

      expect(result.token).toBe('mock_jwt_token');
      expect(result.user.id).toBe('user_id_123');
      expect(result.user.name).toBe('Aarav Sharma');
      expect(result.user.email).toBe('aarav@example.com');
      expect(result.user.role).toBe('customer');
    });

    it('should throw error when user is not found', async () => {
      mockedUser.findOne.mockResolvedValue(null);

      await expect(authService.login(validLoginData)).rejects.toThrow('User not found');
    });

    it('should throw error when password is incorrect', async () => {
      const mockUser = {
        id: 'user_id_123',
        name: 'Aarav Sharma',
        email: 'aarav@example.com',
        phone: '9841234567',
        passwordHash: 'hashed_password',
        role: 'customer',
        isActive: true,
      };

      mockedUser.findOne.mockResolvedValue(mockUser);
      (mockedBcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(authService.login(validLoginData)).rejects.toThrow('Invalid credentials');
    });

    it('should throw error when user account is deactivated', async () => {
      const mockUser = {
        id: 'user_id_123',
        name: 'Aarav Sharma',
        email: 'aarav@example.com',
        phone: '9841234567',
        passwordHash: 'hashed_password',
        role: 'customer',
        isActive: false,
      };

      mockedUser.findOne.mockResolvedValue(mockUser);

      await expect(authService.login(validLoginData)).rejects.toThrow('Account is deactivated');
    });
  });

  describe('verifyToken', () => {
    it('should return decoded token for valid JWT', () => {
      const mockDecoded = {
        userId: 'user_id_123',
        role: 'customer' as const,
        iat: 1700000000,
        exp: 1700086400,
      };

      (mockedJwt.verify as jest.Mock).mockReturnValue(mockDecoded);

      const result = authService.verifyToken('valid_token');

      expect(result).toEqual(mockDecoded);
      expect(mockedJwt.verify).toHaveBeenCalledWith('valid_token', envConfig.jwtSecret);
    });

    it('should throw error for invalid token', () => {
      (mockedJwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('jwt malformed');
      });

      expect(() => authService.verifyToken('invalid_token')).toThrow(
        'Invalid or expired token'
      );
    });

    it('should throw error for expired token', () => {
      (mockedJwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('jwt expired');
      });

      expect(() => authService.verifyToken('expired_token')).toThrow(
        'Invalid or expired token'
      );
    });
  });
});
