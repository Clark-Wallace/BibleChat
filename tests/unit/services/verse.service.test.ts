import { VerseService } from '../../../src/services/bible/verse.service';
import { query } from '../../../src/models/database/database';

// Mock Redis service before importing services that use it
jest.mock('../../../src/services/cache/redis.service', () => ({
  default: {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue('OK'),
    del: jest.fn().mockResolvedValue(1),
    getJSON: jest.fn().mockResolvedValue(null),
    setJSON: jest.fn().mockResolvedValue('OK'),
    getStatus: jest.fn().mockReturnValue({ connected: false })
  }
}));

// Mock the database module
jest.mock('../../../src/models/database/database', () => ({
  query: jest.fn(),
  pool: jest.fn(() => ({
    connect: jest.fn(),
    end: jest.fn()
  }))
}));

describe('VerseService', () => {
  let verseService: VerseService;
  const mockQuery = query as jest.MockedFunction<typeof query>;

  beforeEach(() => {
    verseService = new VerseService();
    jest.clearAllMocks();
  });

  describe('searchVerses', () => {
    it('should search verses with default parameters', async () => {
      const mockResults = {
        rows: [
          {
            id: 1,
            book: 'John',
            chapter: 3,
            verse: 16,
            text: 'For God so loved the world...',
            translation: 'NIV',
            testament: 'NT'
          }
        ],
        rowCount: 1,
        command: 'SELECT',
        oid: 0,
        fields: []
      };

      mockQuery.mockResolvedValueOnce(mockResults);

      const results = await verseService.searchVerses('love');

      expect(mockQuery).toHaveBeenCalled();
      expect(results).toHaveLength(1);
      expect(results[0].book).toBe('John');
    });

    it('should handle empty search results', async () => {
      mockQuery.mockResolvedValueOnce({ 
        rows: [], 
        rowCount: 0,
        command: 'SELECT',
        oid: 0,
        fields: []
      });

      const results = await verseService.searchVerses('nonexistent');
      
      expect(results).toEqual([]);
    });

    it('should handle database errors', async () => {
      mockQuery.mockRejectedValueOnce(new Error('Database error'));

      await expect(verseService.searchVerses('test'))
        .rejects.toThrow('Database error');
    });
  });

  describe('getRandomVerse', () => {
    it('should return a random verse', async () => {
      const mockVerse = {
        rows: [{
          id: 123,
          book: 'Proverbs',
          chapter: 3,
          verse: 5,
          text: 'Trust in the LORD with all thine heart...',
          translation: 'KJV',
          testament: 'OT'
        }],
        rowCount: 1,
        command: 'SELECT',
        oid: 0,
        fields: []
      };

      mockQuery.mockResolvedValueOnce(mockVerse);

      const verse = await verseService.getRandomVerse();

      expect(mockQuery).toHaveBeenCalled();
      expect(verse).toBeDefined();
      expect(verse?.book).toBe('Proverbs');
    });

    it('should return null when no verses found', async () => {
      mockQuery.mockResolvedValueOnce({ 
        rows: [], 
        rowCount: 0,
        command: 'SELECT',
        oid: 0,
        fields: []
      });

      const verse = await verseService.getRandomVerse();
      
      expect(verse).toBeNull();
    });
  });
});