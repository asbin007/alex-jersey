import { validateCustomization, ValidationError } from './orderService';
import { Product } from '../models/associations';

// Mock associations
jest.mock('../models/associations', () => ({
  Product: {
    findByPk: jest.fn(),
  },
}));

const mockedProduct = Product as jest.Mocked<any>;

describe('orderService - Custom Jersey Validation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validateCustomization', () => {
    it('should pass when items have no customization', async () => {
      const items = [
        { productId: 'product1', quantity: 1, size: 'M' as const },
        { productId: 'product2', quantity: 2, size: 'L' as const },
      ];

      // No product lookup needed since no customization is requested
      await expect(validateCustomization(items)).resolves.toBeUndefined();
    });

    it('should pass when product allows customization and customName is provided', async () => {
      const items = [
        {
          productId: 'product1',
          quantity: 1,
          size: 'M' as const,
          customName: 'MESSI',
        },
      ];

      mockedProduct.findByPk.mockResolvedValue({
        id: 'product1',
        name: 'Argentina Home Jersey',
        allowCustomization: true,
      });

      await expect(validateCustomization(items)).resolves.toBeUndefined();
    });

    it('should pass when product allows customization and customNumber is provided', async () => {
      const items = [
        {
          productId: 'product1',
          quantity: 1,
          size: 'M' as const,
          customNumber: '10',
        },
      ];

      mockedProduct.findByPk.mockResolvedValue({
        id: 'product1',
        name: 'Argentina Home Jersey',
        allowCustomization: true,
      });

      await expect(validateCustomization(items)).resolves.toBeUndefined();
    });

    it('should pass when product allows customization and both customName and customNumber are provided', async () => {
      const items = [
        {
          productId: 'product1',
          quantity: 1,
          size: 'M' as const,
          customName: 'MESSI',
          customNumber: '10',
        },
      ];

      mockedProduct.findByPk.mockResolvedValue({
        id: 'product1',
        name: 'Argentina Home Jersey',
        allowCustomization: true,
      });

      await expect(validateCustomization(items)).resolves.toBeUndefined();
    });

    it('should reject when product does not allow customization and customName is provided', async () => {
      const items = [
        {
          productId: 'product1',
          quantity: 1,
          size: 'M' as const,
          customName: 'MESSI',
        },
      ];

      mockedProduct.findByPk.mockResolvedValue({
        id: 'product1',
        name: 'Nepal Retro Jersey',
        allowCustomization: false,
      });

      await expect(validateCustomization(items)).rejects.toThrow(ValidationError);
      await expect(validateCustomization(items)).rejects.toThrow(
        'Product "Nepal Retro Jersey" does not allow customization'
      );
    });

    it('should reject when product does not allow customization and customNumber is provided', async () => {
      const items = [
        {
          productId: 'product1',
          quantity: 1,
          size: 'L' as const,
          customNumber: '7',
        },
      ];

      mockedProduct.findByPk.mockResolvedValue({
        id: 'product1',
        name: 'Nepal Retro Jersey',
        allowCustomization: false,
      });

      await expect(validateCustomization(items)).rejects.toThrow(ValidationError);
      await expect(validateCustomization(items)).rejects.toThrow(
        'Product "Nepal Retro Jersey" does not allow customization'
      );
    });

    it('should reject when product does not allow customization and both customName and customNumber are provided', async () => {
      const items = [
        {
          productId: 'product1',
          quantity: 1,
          size: 'XL' as const,
          customName: 'RONALDO',
          customNumber: '7',
        },
      ];

      mockedProduct.findByPk.mockResolvedValue({
        id: 'product1',
        name: 'Nepal Retro Jersey',
        allowCustomization: false,
      });

      await expect(validateCustomization(items)).rejects.toThrow(ValidationError);
      await expect(validateCustomization(items)).rejects.toThrow(
        'Product "Nepal Retro Jersey" does not allow customization'
      );
    });

    it('should throw ValidationError when product is not found', async () => {
      const items = [
        {
          productId: 'nonexistent',
          quantity: 1,
          size: 'M' as const,
          customName: 'MESSI',
        },
      ];

      mockedProduct.findByPk.mockResolvedValue(null);

      await expect(validateCustomization(items)).rejects.toThrow(ValidationError);
      await expect(validateCustomization(items)).rejects.toThrow(
        'Product nonexistent not found'
      );
    });

    it('should validate each item independently - mixed customizable and non-customizable', async () => {
      const items = [
        {
          productId: 'product1',
          quantity: 1,
          size: 'M' as const,
          customName: 'MESSI',
        },
        {
          productId: 'product2',
          quantity: 1,
          size: 'L' as const,
          customName: 'RONALDO',
        },
      ];

      mockedProduct.findByPk
        .mockResolvedValueOnce({
          id: 'product1',
          name: 'Argentina Home Jersey',
          allowCustomization: true,
        })
        .mockResolvedValueOnce({
          id: 'product2',
          name: 'Nepal Retro Jersey',
          allowCustomization: false,
        });

      await expect(validateCustomization(items)).rejects.toThrow(
        'Product "Nepal Retro Jersey" does not allow customization'
      );
    });

    it('should not check product when item has no customization even if product disallows it', async () => {
      const items = [
        {
          productId: 'product1',
          quantity: 2,
          size: 'L' as const,
          // No customName or customNumber
        },
      ];

      // Product.findByPk should NOT be called since no customization is requested
      await expect(validateCustomization(items)).resolves.toBeUndefined();
      expect(mockedProduct.findByPk).not.toHaveBeenCalled();
    });

    // ---- Field-level validation: customName ----

    it('should reject customName longer than 20 characters', async () => {
      const items = [
        {
          productId: 'product1',
          quantity: 1,
          size: 'M' as const,
          customName: 'AVERYLONGPLAYERNAME123', // 22 chars
        },
      ];

      await expect(validateCustomization(items)).rejects.toThrow(ValidationError);
      await expect(validateCustomization(items)).rejects.toThrow(
        'Custom name must not exceed 20 characters'
      );
      expect(mockedProduct.findByPk).not.toHaveBeenCalled();
    });

    it('should reject customName with digits', async () => {
      const items = [
        {
          productId: 'product1',
          quantity: 1,
          size: 'M' as const,
          customName: 'MESS1',
        },
      ];

      await expect(validateCustomization(items)).rejects.toThrow(ValidationError);
      await expect(validateCustomization(items)).rejects.toThrow(
        'Custom name must contain only letters and spaces'
      );
    });

    it('should reject customName with special characters', async () => {
      const items = [
        {
          productId: 'product1',
          quantity: 1,
          size: 'M' as const,
          customName: 'MESSI!',
        },
      ];

      await expect(validateCustomization(items)).rejects.toThrow(ValidationError);
      await expect(validateCustomization(items)).rejects.toThrow(
        'Custom name must contain only letters and spaces'
      );
    });

    it('should accept customName with letters and spaces (exactly 20 chars)', async () => {
      const items = [
        {
          productId: 'product1',
          quantity: 1,
          size: 'M' as const,
          customName: 'CRISTIANO RONALDO DO', // exactly 20 chars
        },
      ];

      mockedProduct.findByPk.mockResolvedValue({
        id: 'product1',
        name: 'Portugal Home Jersey',
        allowCustomization: true,
      });

      await expect(validateCustomization(items)).resolves.toBeUndefined();
    });

    // ---- Field-level validation: customNumber ----

    it('should reject customNumber less than 0', async () => {
      const items = [
        {
          productId: 'product1',
          quantity: 1,
          size: 'M' as const,
          customNumber: '-1',
        },
      ];

      await expect(validateCustomization(items)).rejects.toThrow(ValidationError);
      await expect(validateCustomization(items)).rejects.toThrow(
        'Custom number must be an integer between 0 and 99'
      );
    });

    it('should reject customNumber greater than 99', async () => {
      const items = [
        {
          productId: 'product1',
          quantity: 1,
          size: 'M' as const,
          customNumber: '100',
        },
      ];

      await expect(validateCustomization(items)).rejects.toThrow(ValidationError);
      await expect(validateCustomization(items)).rejects.toThrow(
        'Custom number must be an integer between 0 and 99'
      );
    });

    it('should accept customNumber at boundary values 0 and 99', async () => {
      mockedProduct.findByPk.mockResolvedValue({
        id: 'product1',
        name: 'Nepal Home Jersey',
        allowCustomization: true,
      });

      const itemsWithZero = [
        { productId: 'product1', quantity: 1, size: 'M' as const, customNumber: '0' },
      ];
      await expect(validateCustomization(itemsWithZero)).resolves.toBeUndefined();

      const itemsWith99 = [
        { productId: 'product1', quantity: 1, size: 'M' as const, customNumber: '99' },
      ];
      await expect(validateCustomization(itemsWith99)).resolves.toBeUndefined();
    });

    it('should reject customNumber that is not an integer (decimal)', async () => {
      const items = [
        {
          productId: 'product1',
          quantity: 1,
          size: 'M' as const,
          customNumber: '10.5',
        },
      ];

      await expect(validateCustomization(items)).rejects.toThrow(ValidationError);
      await expect(validateCustomization(items)).rejects.toThrow(
        'Custom number must be an integer between 0 and 99'
      );
    });
  });
});
