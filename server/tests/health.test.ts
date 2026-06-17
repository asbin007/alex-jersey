import request from 'supertest';
import app from '../src/index';

describe('Health Check API', () => {
  it('should return a 200 OK status from the health endpoint', async () => {
    const response = await request(app).get('/api/health');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'ok');
    expect(response.body).toHaveProperty('message', 'Nepal Jersey API is running');
  });
});
