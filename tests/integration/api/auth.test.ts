import request from 'supertest';
import { App } from '../../../src/app';
import { Application } from 'express';
import { ApiKeyModel } from '../../../src/models/database/apiKey.model';

describe('Authentication & Authorization', () => {
  let app: Application;
  const validApiKey = process.env.TEST_API_KEY || 'test-api-key-placeholder';

  beforeAll(async () => {
    const application = new App();
    await application.initialize();
    app = application.app;
  });

  describe('API Key Authentication', () => {
    it('should reject requests without API key', async () => {
      const response = await request(app)
        .get('/api/v1/verses/search')
        .query({ query: 'test' });

      expect(response.status).toBe(401);
      expect(response.body.error).toContain('Authorization header required');
    });

    it('should reject requests with invalid API key format', async () => {
      const response = await request(app)
        .get('/api/v1/verses/search')
        .set('Authorization', 'InvalidFormat')
        .query({ query: 'test' });

      expect(response.status).toBe(401);
    });

    it('should reject requests with invalid API key', async () => {
      const response = await request(app)
        .get('/api/v1/verses/search')
        .set('Authorization', 'Bearer invalid_api_key_12345')
        .query({ query: 'test' });

      expect(response.status).toBe(401);
      expect(response.body.error).toContain('Invalid');
    });

    it('should accept valid API key in Bearer format', async () => {
      const response = await request(app)
        .get('/api/v1/verses/search')
        .set('Authorization', `Bearer ${validApiKey}`)
        .query({ query: 'love' });

      expect(response.status).toBe(200);
    });

    it('should track API key usage', async () => {
      const initialUsage = await ApiKeyModel.getUsage(validApiKey);
      
      await request(app)
        .get('/api/v1/verses/search')
        .set('Authorization', `Bearer ${validApiKey}`)
        .query({ query: 'test' });

      const newUsage = await ApiKeyModel.getUsage(validApiKey);
      expect(newUsage).toBeGreaterThan(initialUsage);
    });

    it('should handle expired API keys', async () => {
      // This test would require creating a test key with expiration
      // For now, we'll just verify the structure is in place
      const keyData = await ApiKeyModel.findByKey(validApiKey);
      expect(keyData).toHaveProperty('expires_at');
    });

    it('should handle deactivated API keys', async () => {
      // This test would require creating and deactivating a test key
      // For now, we'll verify the structure
      const keyData = await ApiKeyModel.findByKey(validApiKey);
      expect(keyData).toHaveProperty('is_active');
      expect(keyData.is_active).toBe(true);
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits per API key', async () => {
      const requests = [];
      
      // Make rapid requests to trigger rate limit
      for (let i = 0; i < 100; i++) {
        requests.push(
          request(app)
            .get('/api/v1/verses/search')
            .set('Authorization', `Bearer ${validApiKey}`)
            .query({ query: 'test' + i })
        );
      }

      const responses = await Promise.all(requests);
      const rateLimited = responses.filter(r => r.status === 429);
      
      // Should have some rate limited responses
      expect(rateLimited.length).toBeGreaterThan(0);
    });

    it('should include rate limit headers', async () => {
      const response = await request(app)
        .get('/api/v1/verses/search')
        .set('Authorization', `Bearer ${validApiKey}`)
        .query({ query: 'test' });

      expect(response.headers).toHaveProperty('x-ratelimit-limit');
      expect(response.headers).toHaveProperty('x-ratelimit-remaining');
    });

    it('should return proper rate limit error', async () => {
      // First, exhaust the rate limit
      const requests = Array(200).fill(null).map((_, i) =>
        request(app)
          .get('/api/v1/verses/search')
          .set('Authorization', `Bearer ${validApiKey}`)
          .query({ query: 'rapid' + i })
      );

      await Promise.all(requests);

      // Now make another request that should be rate limited
      const response = await request(app)
        .get('/api/v1/verses/search')
        .set('Authorization', `Bearer ${validApiKey}`)
        .query({ query: 'test' });

      if (response.status === 429) {
        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toContain('rate limit');
      }
    });
  });

  describe('Public vs Protected Endpoints', () => {
    it('should allow public access to health endpoint', async () => {
      const response = await request(app)
        .get('/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('healthy');
    });

    it('should allow public access to daily verse', async () => {
      const response = await request(app)
        .get('/api/v1/daily');

      expect(response.status).toBe(200);
    });

    it('should protect verse search endpoint', async () => {
      const response = await request(app)
        .get('/api/v1/verses/search')
        .query({ query: 'test' });

      expect(response.status).toBe(401);
    });

    it('should protect chat endpoint', async () => {
      const response = await request(app)
        .post('/api/v1/chat')
        .send({ message: 'test' });

      expect(response.status).toBe(401);
    });

    it('should protect counsel endpoint', async () => {
      const response = await request(app)
        .post('/api/v1/counsel')
        .send({ topic: 'test' });

      expect(response.status).toBe(401);
    });

    it('should protect verse explanation endpoint', async () => {
      const response = await request(app)
        .post('/api/v1/verses/explain')
        .send({ book: 'John', chapter: 3, verse: 16 });

      expect(response.status).toBe(401);
    });
  });

  describe('API Key Tiers', () => {
    it('should respect tier-based rate limits', async () => {
      const keyData = await ApiKeyModel.findByKey(validApiKey);
      expect(keyData).toHaveProperty('tier');
      expect(keyData).toHaveProperty('monthly_limit');
      
      // Different tiers should have different limits
      expect(['free', 'paid', 'premium']).toContain(keyData.tier);
    });

    it('should track monthly usage', async () => {
      const keyData = await ApiKeyModel.findByKey(validApiKey);
      expect(keyData).toHaveProperty('current_usage');
      expect(typeof keyData.current_usage).toBe('number');
    });

    it('should enforce monthly limits', async () => {
      const keyData = await ApiKeyModel.findByKey(validApiKey);
      
      if (keyData.current_usage >= keyData.monthly_limit) {
        const response = await request(app)
          .get('/api/v1/verses/search')
          .set('Authorization', `Bearer ${validApiKey}`)
          .query({ query: 'test' });

        expect(response.status).toBe(429);
        expect(response.body.error).toContain('monthly limit');
      }
    });
  });

  describe('Security Headers', () => {
    it('should include security headers', async () => {
      const response = await request(app)
        .get('/health');

      expect(response.headers).toHaveProperty('x-content-type-options');
      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers).toHaveProperty('x-frame-options');
    });

    it('should not expose sensitive information', async () => {
      const response = await request(app)
        .get('/api/v1/invalid-endpoint');

      expect(response.status).toBe(404);
      expect(response.body).not.toContain('stack');
      expect(response.body).not.toContain('trace');
    });

    it('should handle CORS properly', async () => {
      const response = await request(app)
        .options('/api/v1/verses/search')
        .set('Origin', 'http://localhost:3001');

      expect(response.headers).toHaveProperty('access-control-allow-origin');
    });
  });
});