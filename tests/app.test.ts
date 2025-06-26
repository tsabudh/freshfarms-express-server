import request from 'supertest';
import app from '../src/app';

describe('App routes', () => {
  describe('GET /health-check', () => {
    it('should return status 200 and a success message', async () => {
      const res = await request(app).get('/api/health-check');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({
      status: 'success',
      message: 'Server is running fine.',
    });
    });
  });
});
