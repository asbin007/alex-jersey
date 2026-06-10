import { Op } from 'sequelize';
import { buildProductQuery, getSortOption } from './productService';

// Mock database config to prevent Sequelize initialization during unit tests
jest.mock('../config/db', () => ({
  sequelize: {
    escape: jest.fn((val) => `'${val}'`),
    literal: jest.fn((val) => `LITERAL_MOCK(${val})`),
  },
}));

// Mock associations to prevent actual model definitions and init calls during unit tests
jest.mock('../models/associations', () => ({
  Product: {},
  SizeStock: {},
}));

describe('buildProductQuery', () => {
  it('should always include isActive: true', () => {
    const query = buildProductQuery({});
    expect(query.isActive).toBe(true);
  });

  it('should add case-insensitive ILIKE for team filter', () => {
    const query = buildProductQuery({ team: 'Nepal' });
    expect(query.team).toEqual({ [Op.iLike]: '%Nepal%' });
  });

  it('should add exact match for category filter', () => {
    const query = buildProductQuery({ category: 'worldcup' });
    expect(query.category).toBe('worldcup');
  });

  it('should add subquery match for size filter', () => {
    const query = buildProductQuery({ size: 'L' });
    expect(query.id).toEqual({
      [Op.in]: 'LITERAL_MOCK((\n        SELECT "productId" FROM "SizeStocks" \n        WHERE "size" = \'L\' AND "stock" > 0\n      ))',
    });
  });

  it('should add price range with gte and lte', () => {
    const query = buildProductQuery({ priceMin: 1000, priceMax: 5000 });
    expect(query.price).toEqual({ [Op.gte]: 1000, [Op.lte]: 5000 });
  });

  it('should add only gte when only priceMin is provided', () => {
    const query = buildProductQuery({ priceMin: 1000 });
    expect(query.price).toEqual({ [Op.gte]: 1000 });
  });

  it('should add only lte when only priceMax is provided', () => {
    const query = buildProductQuery({ priceMax: 5000 });
    expect(query.price).toEqual({ [Op.lte]: 5000 });
  });

  it('should add exact match for jerseyType filter', () => {
    const query = buildProductQuery({ jerseyType: 'home' });
    expect(query.jerseyType).toBe('home');
  });

  it('should combine multiple filters', () => {
    const query = buildProductQuery({
      team: 'Argentina',
      category: 'worldcup',
      size: 'M',
      priceMin: 2000,
      priceMax: 4000,
      jerseyType: 'away',
    });

    expect(query.isActive).toBe(true);
    expect(query.team).toEqual({ [Op.iLike]: '%Argentina%' });
    expect(query.category).toBe('worldcup');
    expect(query.id).toEqual({
      [Op.in]: 'LITERAL_MOCK((\n        SELECT "productId" FROM "SizeStocks" \n        WHERE "size" = \'M\' AND "stock" > 0\n      ))',
    });
    expect(query.price).toEqual({ [Op.gte]: 2000, [Op.lte]: 4000 });
    expect(query.jerseyType).toBe('away');
  });
});

describe('getSortOption', () => {
  it('should return [["price", "ASC"]] for price sort', () => {
    expect(getSortOption('price')).toEqual([['price', 'ASC']]);
  });

  it('should return [["createdAt", "DESC"]] for newest sort', () => {
    expect(getSortOption('newest')).toEqual([['createdAt', 'DESC']]);
  });

  it('should return [["reviewCount", "DESC"], ["rating", "DESC"]] for popular sort', () => {
    expect(getSortOption('popular')).toEqual([['reviewCount', 'DESC'], ['rating', 'DESC']]);
  });

  it('should return [["createdAt", "DESC"]] as default when no sortBy', () => {
    expect(getSortOption()).toEqual([['createdAt', 'DESC']]);
  });

  it('should return [["createdAt", "DESC"]] for unknown sortBy value', () => {
    expect(getSortOption('unknown')).toEqual([['createdAt', 'DESC']]);
  });
});
