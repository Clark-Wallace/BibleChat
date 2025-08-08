// API Service for BibleChat
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
const API_KEY = import.meta.env.VITE_API_KEY || 'dev_key_e0dfdd19d300428bae938459';

interface ChatResponse {
  response: string;
  verses?: any[];
  metadata?: {
    confidence: number;
    tokensUsed: number;
  };
  followUpQuestions?: string[];
  relatedTopics?: string[];
}

interface VerseSearchResponse {
  results: any[];
  count: number;
  query: string;
}

interface DailyVerseResponse {
  verse: any;
  reflection: string;
  prayer: string;
  application: string;
}

class BibleChatAPI {
  private headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${API_KEY}`
  };

  async chat(message: string, mode: string = 'conversational'): Promise<ChatResponse> {
    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          message,
          mode,
          translation: 'KJV',
          includeCommentary: false,
          maxVerses: 5
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Chat API error:', error);
      throw error;
    }
  }

  async searchVerses(
    query: string, 
    options: {
      limit?: number;
      translation?: string;
      book?: string;
      testament?: string;
    } = {}
  ): Promise<VerseSearchResponse> {
    try {
      const params = new URLSearchParams({
        query,
        limit: (options.limit || 10).toString(),
        translation: options.translation || 'KJV',
        ...(options.book && { book: options.book }),
        ...(options.testament && { testament: options.testament })
      });

      const response = await fetch(`${API_URL}/verses/search?${params}`, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Search API error:', error);
      throw error;
    }
  }

  async getDailyVerse(): Promise<DailyVerseResponse> {
    try {
      const response = await fetch(`${API_URL}/daily`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
          // Daily verse doesn't require authentication
        }
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Daily verse API error:', error);
      throw error;
    }
  }

  async explainVerse(
    book: string,
    chapter: number,
    verse: number,
    depth: 'simple' | 'moderate' | 'scholarly' = 'moderate'
  ): Promise<any> {
    try {
      const response = await fetch(`${API_URL}/verses/explain`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          book,
          chapter,
          verse,
          depth,
          translation: 'KJV'
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Explain API error:', error);
      throw error;
    }
  }

  async getTopicVerses(topic: string, limit: number = 10): Promise<any> {
    try {
      const response = await fetch(`${API_URL}/topics/${topic}?limit=${limit}`, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Topics API error:', error);
      throw error;
    }
  }

  async getCounsel(topic: string, situation?: string): Promise<any> {
    try {
      const response = await fetch(`${API_URL}/counsel`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          topic,
          situation
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Counsel API error:', error);
      throw error;
    }
  }
}

export const api = new BibleChatAPI();