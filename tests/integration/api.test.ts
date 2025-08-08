import axios from 'axios';

const API_URL = 'http://localhost:3000';
const API_KEY = 'dev_key_e0dfdd19d300428bae938459';

describe('BibleChat API Integration Tests', () => {
  // Test if API is running
  describe('Health Check', () => {
    it('should return healthy status', async () => {
      const response = await axios.get(`${API_URL}/health`);
      
      expect(response.status).toBe(200);
      expect(response.data.status).toBe('healthy');
      expect(response.data.services.database.connected).toBe(true);
    });
  });

  describe('Daily Verse Endpoint', () => {
    it('should return daily verse without authentication', async () => {
      const response = await axios.get(`${API_URL}/api/v1/daily`);
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('verse');
      expect(response.data.verse).toHaveProperty('book');
      expect(response.data.verse).toHaveProperty('chapter');
      expect(response.data.verse).toHaveProperty('verse');
      expect(response.data.verse).toHaveProperty('text');
    }, 35000); // Longer timeout for AI generation
  });

  describe('Verse Search Endpoint', () => {
    it('should search verses with authentication', async () => {
      const response = await axios.get(`${API_URL}/api/v1/verses/search`, {
        params: { query: 'love', translation: 'KJV', limit: 5 },
        headers: { Authorization: `Bearer ${API_KEY}` }
      });
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('results');
      expect(Array.isArray(response.data.results)).toBe(true);
      expect(response.data.results.length).toBeGreaterThan(0);
      expect(response.data.results[0]).toHaveProperty('book');
      expect(response.data.results[0]).toHaveProperty('text');
    });

    it('should reject requests without authentication', async () => {
      try {
        await axios.get(`${API_URL}/api/v1/verses/search`, {
          params: { query: 'love' }
        });
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.response.status).toBe(401);
        expect(error.response.data).toHaveProperty('error');
      }
    });

    it('should filter by book', async () => {
      const response = await axios.get(`${API_URL}/api/v1/verses/search`, {
        params: { query: 'God', book: 'Genesis', translation: 'KJV' },
        headers: { Authorization: `Bearer ${API_KEY}` }
      });
      
      expect(response.status).toBe(200);
      if (response.data.results.length > 0) {
        response.data.results.forEach((verse: any) => {
          expect(verse.book).toBe('Genesis');
        });
      }
    });
  });

  describe('Chat Endpoint', () => {
    it('should respond to chat messages', async () => {
      const response = await axios.post(
        `${API_URL}/api/v1/chat`,
        {
          message: 'What does John 3:16 say?',
          mode: 'simple',
          translation: 'KJV'
        },
        {
          headers: { 
            Authorization: `Bearer ${API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('response');
      expect(response.data.response).toBeTruthy();
      expect(response.data).toHaveProperty('metadata');
      expect(response.data.metadata).toHaveProperty('confidence');
    }, 30000);

    it('should validate message field', async () => {
      try {
        await axios.post(
          `${API_URL}/api/v1/chat`,
          { mode: 'simple' }, // Missing message
          {
            headers: { 
              Authorization: `Bearer ${API_KEY}`,
              'Content-Type': 'application/json'
            }
          }
        );
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
    });
  });

  describe('Verse Explanation Endpoint', () => {
    it('should explain a specific verse', async () => {
      const response = await axios.post(
        `${API_URL}/api/v1/verses/explain`,
        {
          book: 'Genesis',
          chapter: 1,
          verse: 1,
          depth: 'simple',
          translation: 'KJV'
        },
        {
          headers: { 
            Authorization: `Bearer ${API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('explanation');
      expect(response.data).toHaveProperty('verse');
      expect(response.data.explanation).toBeTruthy();
    }, 30000);
  });

  describe('Topics Endpoint', () => {
    it('should return verses for a topic', async () => {
      const response = await axios.get(`${API_URL}/api/v1/topics/faith`, {
        headers: { Authorization: `Bearer ${API_KEY}` },
        params: { translation: 'KJV' }
      });
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('topic');
      expect(response.data).toHaveProperty('verses');
      expect(response.data.topic).toBe('faith');
      expect(Array.isArray(response.data.verses)).toBe(true);
    }, 30000);
  });

  describe('Rate Limiting', () => {
    it('should include rate limit headers', async () => {
      const response = await axios.get(`${API_URL}/api/v1/verses/search`, {
        params: { query: 'test' },
        headers: { Authorization: `Bearer ${API_KEY}` }
      });
      
      expect(response.headers).toHaveProperty('x-ratelimit-limit');
      expect(response.headers).toHaveProperty('x-ratelimit-remaining');
    });
  });
});