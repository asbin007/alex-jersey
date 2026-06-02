import { buildProductQuery, getSortOption } from './productService';

describe('buildProductQuery', () => {
  it('should always include isActive: true', () => {
    const query = buildProductQuery({});
    expect(query.isActive).toBe(true);
  });

  it('should add case-insensitive regex for team filter', () => {
    const query = buildProductQuery({ team: 'Nepal' });
    expect(query.team).toEqual({ $regex: 'Nepal', $options: 'i' });
  });

  it('should add exact match for category filter', () => {
    const query = buildProductQuery({ category: 'worldcup' });
    expect(query.category).toBe('worldcup');
  });

  it('should add $elemMatch for size filter with stock > 0', () => {
    const query = buildProductQuery({ size: 'L' });
    expect(query.sizes).toEqual({
      $elemMatch: { size: 'L', stock: { $gt: 0 } },
    });
  });

  it('should add price range with $gte and $lte', () => {
    const query = buildProductQuery({ priceMin: 1000, priceMax: 5000 });
    expect(query.price).toEqual({ $gte: 1000, $lte: 5000 });
  });

  it('should add only $gte when only priceMin is provided', () => {
    const query = buildProductQuery({ priceMin: 1000 });
    expect(query.price).toEqual({ $gte: 1000 });
  });

  it('should add only $lte when only priceMax is provided', () => {
    const query = buildProductQuery({ priceMax: 5000 });
    expect(query.price).toEqual({ $lte: 5000 });
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
    expect(query.team).toEqual({ $regex: 'Argentina', $options: 'i' });
    expect(query.category).toBe('worldcup');
    expect(query.sizes).toEqual({
      $elemMatch: { size: 'M', stock: { $gt: 0 } },
    });
    expect(query.price).toEqual({ $gte: 2000, $lte: 4000 });
    expect(query.jerseyType).toBe('away');
  });
});

describe('getSortOption', () => {
  it('should return { price: 1 } for price sort', () => {
    expect(getSortOption('price')).toEqual({ price: 1 });
  });

  it('should return { createdAt: -1 } for newest sort', () => {
    expect(getSortOption('newest')).toEqual({ createdAt: -1 });
  });

  it('should return { reviewCount: -1, rating: -1 } for popular sort', () => {
    expect(getSortOption('popular')).toEqual({ reviewCount: -1, rating: -1 });
  });

  it('should return { createdAt: -1 } as default when no sortBy', () => {
    expect(getSortOption()).toEqual({ createdAt: -1 });
  });

  it('should return { createdAt: -1 } for unknown sortBy value', () => {
    expect(getSortOption('unknown')).toEqual({ createdAt: -1 });
  });
});
