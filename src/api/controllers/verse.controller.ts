import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { VerseService } from '../../services/bible/verse.service';
import { ChatGPTService } from '../../services/ai/chatGPT.service';
import { verseExplainRequestSchema } from '../../utils/validator';
import { ApiError } from '../middleware/error.middleware';
import logger from '../../utils/logger';

export class VerseController {
  private verseService: VerseService;
  private chatGPTService: ChatGPTService;

  constructor() {
    this.verseService = new VerseService();
    this.chatGPTService = new ChatGPTService();
  }

  async explainVerse(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Validate request
      const { error, value } = verseExplainRequestSchema.validate(req.body);
      if (error) {
        throw new ApiError(400, error.details[0].message);
      }

      const { reference, depth, includeContext, includeGreek, translation } = value;

      // Get the verse
      const verse = await this.verseService.getVerseByReference(reference, translation);
      if (!verse) {
        throw new ApiError(404, 'Verse not found');
      }

      // Get verse context if requested
      let context = '';
      let crossReferences: string[] = [];
      
      if (includeContext) {
        const verseContext = await this.verseService.getVerseContext(reference, translation);
        context = verseContext.chapterContext;
        
        // Get cross references
        const { SearchService } = await import('../../services/bible/search.service');
        const searchService = new SearchService();
        crossReferences = await searchService.searchCrossReferences(reference);
      }

      // Generate explanation
      const explanation = await this.chatGPTService.explainVerse(
        verse,
        depth,
        includeGreek
      );

      // Generate practical application
      const applicationPrompt = `How can someone apply ${reference} in their daily life?`;
      const applicationResponse = await this.chatGPTService.generateResponse(
        applicationPrompt,
        '',
        [{ ...verse, reference, relevance: 1 }],
        'simple'
      );

      res.json({
        verse: {
          ...verse,
          reference,
        },
        explanation,
        context: includeContext ? context : undefined,
        application: applicationResponse.response,
        crossReferences,
        originalLanguage: includeGreek ? {
          note: 'Greek/Hebrew analysis would require additional linguistic resources',
        } : undefined,
      });
    } catch (error: any) {
      logger.error('Explain verse error:', error);
      
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({
          error: error.message,
          statusCode: error.statusCode,
        });
      } else {
        res.status(500).json({
          error: 'Failed to explain verse',
        });
      }
    }
  }

  async getVerse(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { reference } = req.params;
      const { translation = 'NIV' } = req.query;

      if (!reference) {
        throw new ApiError(400, 'Verse reference required');
      }

      const verse = await this.verseService.getVerseByReference(
        reference,
        translation as string
      );

      if (!verse) {
        throw new ApiError(404, 'Verse not found');
      }

      res.json({
        ...verse,
        reference,
      });
    } catch (error: any) {
      logger.error('Get verse error:', error);
      
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({
          error: error.message,
          statusCode: error.statusCode,
        });
      } else {
        res.status(500).json({
          error: 'Failed to retrieve verse',
        });
      }
    }
  }

  async searchVerses(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { 
        query,
        limit = 10,
        translation = 'NIV',
        book,
        testament,
      } = req.query;

      if (!query) {
        throw new ApiError(400, 'Search query required');
      }

      const { SearchService } = await import('../../services/bible/search.service');
      const searchService = new SearchService();

      const verses = await searchService.searchBible({
        query: query as string,
        book: book as string,
        testament: testament as 'old' | 'new',
        translation: translation as string,
        limit: parseInt(limit as string, 10),
      });

      res.json({
        query,
        results: verses,
        count: verses.length,
      });
    } catch (error: any) {
      logger.error('Search verses error:', error);
      
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({
          error: error.message,
          statusCode: error.statusCode,
        });
      } else {
        res.status(500).json({
          error: 'Failed to search verses',
        });
      }
    }
  }

  async getVerseRange(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { reference } = req.params;
      const { translation = 'NIV' } = req.query;

      if (!reference) {
        throw new ApiError(400, 'Verse reference required');
      }

      const verses = await this.verseService.getVerseRange(
        reference,
        translation as string
      );

      if (verses.length === 0) {
        throw new ApiError(404, 'Verses not found');
      }

      res.json({
        reference,
        verses,
        count: verses.length,
      });
    } catch (error: any) {
      logger.error('Get verse range error:', error);
      
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({
          error: error.message,
          statusCode: error.statusCode,
        });
      } else {
        res.status(500).json({
          error: 'Failed to retrieve verse range',
        });
      }
    }
  }
}