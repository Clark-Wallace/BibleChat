import request from 'supertest';
import { App } from '../../../src/app';
import { Application } from 'express';

describe('Verses API Endpoints', () => {
  let app: Application;
  const validApiKey = process.env.TEST_API_KEY || 'test-api-key-placeholder';

  beforeAll(async () => {
    const application = new App();
    await application.initialize();
    app = application.app;
  });

  describe('GET /api/v1/verses/search', () => {
    it('should search verses by query', async () => {
      const response = await request(app)
        .get('/api/v1/verses/search')
        .query({ query: 'love' })
        .set('Authorization', `Bearer ${validApiKey}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('results');
      expect(response.body).toHaveProperty('count');
      expect(Array.isArray(response.body.results)).toBe(true);
    });

    it('should filter by translation', async () => {
      const response = await request(app)
        .get('/api/v1/verses/search')
        .query({ 
          query: 'faith',
          translation: 'KJV'
        })
        .set('Authorization', `Bearer ${validApiKey}`);

      expect(response.status).toBe(200);
      response.body.results.forEach((verse: any) => {
        expect(verse.translation).toBe('KJV');
      });
    });

    it('should filter by book', async () => {
      const response = await request(app)
        .get('/api/v1/verses/search')
        .query({ 
          query: 'God',
          book: 'Genesis'
        })
        .set('Authorization', `Bearer ${validApiKey}`);

      expect(response.status).toBe(200);
      response.body.results.forEach((verse: any) => {
        expect(verse.book).toBe('Genesis');
      });
    });

    it('should filter by testament', async () => {
      const response = await request(app)
        .get('/api/v1/verses/search')
        .query({ 
          query: 'Jesus',
          testament: 'NT'
        })
        .set('Authorization', `Bearer ${validApiKey}`);

      expect(response.status).toBe(200);
      response.body.results.forEach((verse: any) => {
        expect(verse.testament).toBe('NT');
      });
    });

    it('should respect limit parameter', async () => {
      const response = await request(app)
        .get('/api/v1/verses/search')
        .query({ 
          query: 'God',
          limit: 5
        })
        .set('Authorization', `Bearer ${validApiKey}`);

      expect(response.status).toBe(200);
      expect(response.body.results.length).toBeLessThanOrEqual(5);
    });

    it('should handle empty search results', async () => {
      const response = await request(app)
        .get('/api/v1/verses/search')
        .query({ query: 'xyznonexistentwordxyz' })
        .set('Authorization', `Bearer ${validApiKey}`);

      expect(response.status).toBe(200);
      expect(response.body.results).toEqual([]);
      expect(response.body.count).toBe(0);
    });

    it('should require search query', async () => {
      const response = await request(app)
        .get('/api/v1/verses/search')
        .set('Authorization', `Bearer ${validApiKey}`);

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    it('should validate limit parameter', async () => {
      const response = await request(app)
        .get('/api/v1/verses/search')
        .query({ 
          query: 'test',
          limit: 'invalid'
        })
        .set('Authorization', `Bearer ${validApiKey}`);

      expect(response.status).toBe(400);
    });

    it('should sort results by relevance', async () => {
      const response = await request(app)
        .get('/api/v1/verses/search')
        .query({ query: 'love God' })
        .set('Authorization', `Bearer ${validApiKey}`);

      expect(response.status).toBe(200);
      if (response.body.results.length > 1) {
        const relevances = response.body.results.map((v: any) => v.relevance || v.rank);
        for (let i = 1; i < relevances.length; i++) {
          expect(relevances[i]).toBeLessThanOrEqual(relevances[i - 1]);
        }
      }
    });
  });

  describe('POST /api/v1/verses/explain', () => {
    it('should explain a verse', async () => {
      const response = await request(app)
        .post('/api/v1/verses/explain')
        .set('Authorization', `Bearer ${validApiKey}`)
        .send({
          book: 'John',
          chapter: 3,
          verse: 16
        })
        .timeout(20000);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('explanation');
      expect(response.body).toHaveProperty('verse');
      expect(response.body.explanation).toBeTruthy();
    }, 30000);

    it('should support different explanation depths', async () => {
      const depths = ['simple', 'moderate', 'scholarly'];
      
      for (const depth of depths) {
        const response = await request(app)
          .post('/api/v1/verses/explain')
          .set('Authorization', `Bearer ${validApiKey}`)
          .send({
            book: 'Genesis',
            chapter: 1,
            verse: 1,
            depth
          })
          .timeout(20000);

        expect(response.status).toBe(200);
        expect(response.body.explanation).toBeTruthy();
      }
    }, 60000);

    it('should include Greek/Hebrew when requested', async () => {
      const response = await request(app)
        .post('/api/v1/verses/explain')
        .set('Authorization', `Bearer ${validApiKey}`)
        .send({
          book: 'Romans',
          chapter: 8,
          verse: 28,
          depth: 'scholarly',
          includeOriginalLanguage: true
        })
        .timeout(20000);

      expect(response.status).toBe(200);
      expect(response.body.explanation).toBeTruthy();
    }, 30000);

    it('should validate verse reference', async () => {
      const response = await request(app)
        .post('/api/v1/verses/explain')
        .set('Authorization', `Bearer ${validApiKey}`)
        .send({
          book: 'InvalidBook',
          chapter: 999,
          verse: 999
        });

      expect(response.status).toBe(404);
      expect(response.body.error).toBeDefined();
    });

    it('should require all verse components', async () => {
      const response = await request(app)
        .post('/api/v1/verses/explain')
        .set('Authorization', `Bearer ${validApiKey}`)
        .send({
          book: 'John',
          chapter: 3
          // Missing verse number
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('GET /api/v1/daily', () => {
    it('should return daily verse without authentication', async () => {
      const response = await request(app)
        .get('/api/v1/daily');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('verse');
      expect(response.body).toHaveProperty('reflection');
      expect(response.body).toHaveProperty('prayer');
      expect(response.body).toHaveProperty('application');
    });

    it('should return consistent verse for the same day', async () => {
      const response1 = await request(app).get('/api/v1/daily');
      const response2 = await request(app).get('/api/v1/daily');

      expect(response1.body.verse.id).toBe(response2.body.verse.id);
    });

    it('should include verse details', async () => {
      const response = await request(app).get('/api/v1/daily');

      expect(response.status).toBe(200);
      expect(response.body.verse).toHaveProperty('book');
      expect(response.body.verse).toHaveProperty('chapter');
      expect(response.body.verse).toHaveProperty('verse');
      expect(response.body.verse).toHaveProperty('text');
      expect(response.body.verse).toHaveProperty('reference');
    });

    it('should generate AI-powered reflection', async () => {
      const response = await request(app)
        .get('/api/v1/daily')
        .timeout(20000);

      expect(response.status).toBe(200);
      expect(response.body.reflection).toBeTruthy();
      expect(response.body.reflection.length).toBeGreaterThan(100);
    }, 30000);

    it('should generate prayer based on verse', async () => {
      const response = await request(app)
        .get('/api/v1/daily')
        .timeout(20000);

      expect(response.status).toBe(200);
      expect(response.body.prayer).toBeTruthy();
      expect(response.body.prayer.length).toBeGreaterThan(50);
    }, 30000);
  });

  describe('GET /api/v1/topics/:topic', () => {
    it('should return verses for a given topic', async () => {
      const response = await request(app)
        .get('/api/v1/topics/love')
        .set('Authorization', `Bearer ${validApiKey}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('topic');
      expect(response.body).toHaveProperty('verses');
      expect(response.body).toHaveProperty('overview');
      expect(response.body.topic).toBe('love');
      expect(Array.isArray(response.body.verses)).toBe(true);
    });

    it('should generate topic overview', async () => {
      const response = await request(app)
        .get('/api/v1/topics/faith')
        .set('Authorization', `Bearer ${validApiKey}`)
        .timeout(20000);

      expect(response.status).toBe(200);
      expect(response.body.overview).toBeTruthy();
      expect(response.body.overview).toContain('faith');
    }, 30000);

    it('should include relevant verses', async () => {
      const response = await request(app)
        .get('/api/v1/topics/forgiveness')
        .set('Authorization', `Bearer ${validApiKey}`);

      expect(response.status).toBe(200);
      expect(response.body.verses.length).toBeGreaterThan(0);
      response.body.verses.forEach((verse: any) => {
        expect(verse).toHaveProperty('book');
        expect(verse).toHaveProperty('text');
      });
    });

    it('should handle uncommon topics', async () => {
      const response = await request(app)
        .get('/api/v1/topics/patience')
        .set('Authorization', `Bearer ${validApiKey}`);

      expect(response.status).toBe(200);
      expect(response.body.topic).toBe('patience');
    });

    it('should respect limit parameter', async () => {
      const response = await request(app)
        .get('/api/v1/topics/prayer')
        .query({ limit: 3 })
        .set('Authorization', `Bearer ${validApiKey}`);

      expect(response.status).toBe(200);
      expect(response.body.verses.length).toBeLessThanOrEqual(3);
    });
  });
});