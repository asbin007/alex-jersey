import request from 'supertest';
import app from '../src/index';

describe('Products API', () => {
  it('should fetch all products successfully', async () => {
    const response = await request(app).get('/api/products');
    
    expect(response.status).toBe(200);
    // The response body should be an array of products
    expect(Array.isArray(response.body)).toBe(true);
    
    // If the database has products, the first product should have an ID and name
    if (response.body.length > 0) {
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('name');
    }
  });

  it('should fetch a single product by slug if it exists', async () => {
    // First, get all products to find a valid slug
    const allProducts = await request(app).get('/api/products');
    
    if (allProducts.body.length > 0) {
      const firstProductSlug = allProducts.body[0].slug;
      
      const response = await request(app).get(`/api/products/${firstProductSlug}`);
      expect(response.status).toBe(200);
      expect(response.body.slug).toBe(firstProductSlug);
    }
  });
});
