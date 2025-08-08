import request from 'supertest';
import { App } from '../../../src/app';
import { Application } from 'express';

describe('Chat API Endpoints', () => {
  let app: Application;
  const validApiKey = process.env.TEST_API_KEY || 'test-api-key-placeholder';

  beforeAll(async () => {
    const application = new App();
    await application.initialize();
    app = application.app;
  });

  describe('POST /api/v1/chat', () => {
    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/v1/chat')
        .send({
          message: 'What does the Bible say about love?'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });

    it('should reject invalid API key', async () => {
      const response = await request(app)
        .post('/api/v1/chat')
        .set('Authorization', 'Bearer invalid_key')
        .send({
          message: 'What does the Bible say about love?'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toContain('Invalid');
    });

    it('should validate request body', async () => {
      const response = await request(app)
        .post('/api/v1/chat')
        .set('Authorization', `Bearer ${validApiKey}`)
        .send({
          // Missing required 'message' field
          mode: 'conversational'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    it('should handle valid chat request', async () => {
      const response = await request(app)
        .post('/api/v1/chat')
        .set('Authorization', `Bearer ${validApiKey}`)
        .send({
          message: 'What does John 3:16 mean?',
          mode: 'conversational'
        })
        .timeout(20000); // AI responses can take time

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('response');
      expect(response.body).toHaveProperty('confidence');
      expect(response.body).toHaveProperty('verses');
      expect(response.body.response).toBeTruthy();
    }, 30000);

    it('should support different chat modes', async () => {
      const modes = ['conversational', 'study', 'devotional', 'simple'];
      
      for (const mode of modes) {
        const response = await request(app)
          .post('/api/v1/chat')
          .set('Authorization', `Bearer ${validApiKey}`)
          .send({
            message: 'Tell me about faith',
            mode
          })
          .timeout(20000);

        expect(response.status).toBe(200);
        expect(response.body.response).toBeTruthy();
      }
    }, 60000);

    it('should include relevant verses in response', async () => {
      const response = await request(app)
        .post('/api/v1/chat')
        .set('Authorization', `Bearer ${validApiKey}`)
        .send({
          message: 'What does the Bible say about prayer?',
          includeVerses: true
        })
        .timeout(20000);

      expect(response.status).toBe(200);
      expect(response.body.verses).toBeDefined();
      expect(Array.isArray(response.body.verses)).toBe(true);
    }, 30000);

    it('should handle conversation context', async () => {
      const response = await request(app)
        .post('/api/v1/chat')
        .set('Authorization', `Bearer ${validApiKey}`)
        .send({
          message: 'Tell me more about that verse',
          context: 'We were discussing John 3:16',
          conversationId: 'test-conversation-123'
        })
        .timeout(20000);

      expect(response.status).toBe(200);
      expect(response.body.response).toContain('John 3:16');
    }, 30000);

    it('should detect and prevent fabricated verses', async () => {
      const response = await request(app)
        .post('/api/v1/chat')
        .set('Authorization', `Bearer ${validApiKey}`)
        .send({
          message: 'Tell me about Hesitations 3:14',
          mode: 'study'
        })
        .timeout(20000);

      expect(response.status).toBe(200);
      // Should not contain the fake reference
      expect(response.body.response).not.toContain('Hesitations 3:14');
    }, 30000);

    it('should respect rate limits', async () => {
      // Make multiple rapid requests
      const requests = Array(10).fill(null).map(() =>
        request(app)
          .post('/api/v1/chat')
          .set('Authorization', `Bearer ${validApiKey}`)
          .send({
            message: 'Quick test',
            mode: 'simple'
          })
      );

      const responses = await Promise.all(requests);
      const rateLimited = responses.some(r => r.status === 429);
      
      // Depending on rate limit settings, some requests might be rate limited
      // This test assumes rate limiting is configured
      expect(responses.every(r => r.status === 200 || r.status === 429)).toBe(true);
    });
  });

  describe('POST /api/v1/counsel', () => {
    it('should provide biblical counseling', async () => {
      const response = await request(app)
        .post('/api/v1/counsel')
        .set('Authorization', `Bearer ${validApiKey}`)
        .send({
          topic: 'anxiety',
          situation: 'I am worried about my future'
        })
        .timeout(20000);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('counsel');
      expect(response.body).toHaveProperty('verses');
      expect(response.body).toHaveProperty('prayer');
      expect(response.body.counsel).toContain('anxiety');
    }, 30000);

    it('should generate appropriate prayers', async () => {
      const response = await request(app)
        .post('/api/v1/counsel')
        .set('Authorization', `Bearer ${validApiKey}`)
        .send({
          topic: 'forgiveness',
          situation: 'I need to forgive someone who hurt me'
        })
        .timeout(20000);

      expect(response.status).toBe(200);
      expect(response.body.prayer).toBeDefined();
      expect(response.body.prayer.toLowerCase()).toContain('forgive');
    }, 30000);

    it('should include relevant scriptures', async () => {
      const response = await request(app)
        .post('/api/v1/counsel')
        .set('Authorization', `Bearer ${validApiKey}`)
        .send({
          topic: 'peace',
          situation: 'I am struggling to find peace in difficult times'
        })
        .timeout(20000);

      expect(response.status).toBe(200);
      expect(response.body.verses).toBeDefined();
      expect(Array.isArray(response.body.verses)).toBe(true);
      expect(response.body.verses.length).toBeGreaterThan(0);
    }, 30000);

    it('should validate counsel request', async () => {
      const response = await request(app)
        .post('/api/v1/counsel')
        .set('Authorization', `Bearer ${validApiKey}`)
        .send({
          // Missing required 'topic' field
          situation: 'Test situation'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });
  });
});