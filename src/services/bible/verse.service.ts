import { VerseModel } from '../../models/database/verse.model';
import { Verse, VerseWithRelevance } from '../../models/types/response.types';
import redisService from '../cache/redis.service';
import logger from '../../utils/logger';
import { CACHE_TTL } from '../../utils/constants';
import { verseReferenceParser } from '../../utils/validator';

export class VerseService {
  async searchVerses(
    query: string,
    limit: number = 5,
    translation: string = 'NIV'
  ): Promise<VerseWithRelevance[]> {
    try {
      // Check cache first
      const cacheKey = `verse:search:${query}:${limit}:${translation}`;
      const cached = await redisService.getJSON<VerseWithRelevance[]>(cacheKey);
      if (cached) {
        return cached;
      }

      // Search in database
      const verses = await VerseModel.search(query, limit, translation);
      
      // Add reference and relevance score
      const versesWithRelevance: VerseWithRelevance[] = verses.map((verse: any) => ({
        ...verse,
        reference: `${verse.book} ${verse.chapter}:${verse.verse}`,
        relevance: verse.rank || 0.5,
      }));

      // Cache the results
      await redisService.setJSON(cacheKey, versesWithRelevance, CACHE_TTL.LONG);

      return versesWithRelevance;
    } catch (error) {
      logger.error('Error searching verses:', error);
      throw new Error('Failed to search verses');
    }
  }

  async getVerseByReference(reference: string, translation: string = 'NIV'): Promise<Verse | null> {
    try {
      const parsed = verseReferenceParser(reference);
      if (!parsed) {
        logger.warn(`Invalid verse reference: ${reference}`);
        return null;
      }

      // Check cache
      const cacheKey = `verse:${parsed.book}:${parsed.chapter}:${parsed.verseStart}:${translation}`;
      const cached = await redisService.getJSON<Verse>(cacheKey);
      if (cached) {
        return cached;
      }

      // Get from database
      const verse = await VerseModel.findByReference(
        parsed.book,
        parsed.chapter,
        parsed.verseStart,
        translation
      );

      if (verse) {
        // Cache the verse
        await redisService.setJSON(cacheKey, verse, CACHE_TTL.DAY);
      }

      return verse;
    } catch (error) {
      logger.error('Error getting verse by reference:', error);
      throw new Error('Failed to get verse');
    }
  }

  async getVerseRange(
    reference: string,
    translation: string = 'NIV'
  ): Promise<Verse[]> {
    try {
      const parsed = verseReferenceParser(reference);
      if (!parsed) {
        logger.warn(`Invalid verse reference: ${reference}`);
        return [];
      }

      const { book, chapter, verseStart, verseEnd } = parsed;
      
      if (!verseEnd) {
        // Single verse
        const verse = await this.getVerseByReference(reference, translation);
        return verse ? [verse] : [];
      }

      // Check cache for range
      const cacheKey = `verse:range:${book}:${chapter}:${verseStart}-${verseEnd}:${translation}`;
      const cached = await redisService.getJSON<Verse[]>(cacheKey);
      if (cached) {
        return cached;
      }

      // Get range from database
      const verses = await VerseModel.findByReferenceRange(
        book,
        chapter,
        verseStart,
        verseEnd,
        translation
      );

      if (verses.length > 0) {
        // Cache the range
        await redisService.setJSON(cacheKey, verses, CACHE_TTL.DAY);
      }

      return verses;
    } catch (error) {
      logger.error('Error getting verse range:', error);
      throw new Error('Failed to get verse range');
    }
  }

  async getVersesByTopic(
    topicName: string,
    limit: number = 10,
    translation: string = 'NIV'
  ): Promise<VerseWithRelevance[]> {
    try {
      // Import TopicModel here to avoid circular dependency
      const { TopicModel } = await import('../../models/database/topic.model');
      
      // Find topic
      const topic = await TopicModel.findByName(topicName);
      if (!topic || !topic.id) {
        return [];
      }

      // Check cache
      const cacheKey = `verse:topic:${topicName}:${limit}:${translation}`;
      const cached = await redisService.getJSON<VerseWithRelevance[]>(cacheKey);
      if (cached) {
        return cached;
      }

      // Get verses for topic
      const verses = await VerseModel.findByTopic(topic.id, limit);
      
      // Filter by translation and add reference
      const versesWithRelevance: VerseWithRelevance[] = verses
        .filter((v: any) => v.translation === translation)
        .map((verse: any) => ({
          ...verse,
          reference: `${verse.book} ${verse.chapter}:${verse.verse}`,
          relevance: verse.relevance_score || 0.5,
        }));

      // Cache the results
      await redisService.setJSON(cacheKey, versesWithRelevance, CACHE_TTL.LONG);

      return versesWithRelevance;
    } catch (error) {
      logger.error('Error getting verses by topic:', error);
      throw new Error('Failed to get verses by topic');
    }
  }

  async getRandomVerse(translation: string = 'NIV'): Promise<Verse | null> {
    try {
      // Don't cache random verses
      const verse = await VerseModel.getRandom(translation);
      return verse;
    } catch (error) {
      logger.error('Error getting random verse:', error);
      throw new Error('Failed to get random verse');
    }
  }

  async getVerseContext(reference: string, translation: string = 'NIV'): Promise<{
    previousVerse: Verse | null;
    currentVerse: Verse | null;
    nextVerse: Verse | null;
    chapterContext: string;
  }> {
    try {
      const parsed = verseReferenceParser(reference);
      if (!parsed) {
        return {
          previousVerse: null,
          currentVerse: null,
          nextVerse: null,
          chapterContext: '',
        };
      }

      const { book, chapter, verseStart } = parsed;

      // Get current verse
      const currentVerse = await this.getVerseByReference(reference, translation);

      // Get previous verse
      const previousVerse = verseStart > 1
        ? await VerseModel.findByReference(book, chapter, verseStart - 1, translation)
        : null;

      // Get next verse
      const nextVerse = await VerseModel.findByReference(book, chapter, verseStart + 1, translation);

      // Get chapter context (simplified for now)
      const chapterContext = `${book} chapter ${chapter} discusses...`; // This could be enhanced

      return {
        previousVerse,
        currentVerse,
        nextVerse,
        chapterContext,
      };
    } catch (error) {
      logger.error('Error getting verse context:', error);
      throw new Error('Failed to get verse context');
    }
  }

  formatReference(verse: Verse): string {
    return `${verse.book} ${verse.chapter}:${verse.verse}`;
  }

  async validateVerseExists(reference: string, translation: string = 'NIV'): Promise<boolean> {
    const verse = await this.getVerseByReference(reference, translation);
    return verse !== null;
  }
}