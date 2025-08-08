import { VerseModel } from '../../models/database/verse.model';
import { TopicModel } from '../../models/database/topic.model';
import { Verse, VerseWithRelevance } from '../../models/types/response.types';
import logger from '../../utils/logger';
import { BIBLE_BOOKS } from '../../utils/constants';

export class SearchService {
  async searchBible(params: {
    query: string;
    book?: string;
    testament?: 'old' | 'new';
    translation?: string;
    limit?: number;
  }): Promise<VerseWithRelevance[]> {
    try {
      const { query, book, testament, translation = 'NIV', limit = 10 } = params;

      // Basic search using the verse model
      let verses = await VerseModel.search(query, limit * 2, translation);

      // Filter by book if specified
      if (book) {
        verses = verses.filter(v => v.book.toLowerCase() === book.toLowerCase());
      }

      // Filter by testament if specified
      if (testament) {
        const testamentBooks = testament === 'old' 
          ? BIBLE_BOOKS.OLD_TESTAMENT 
          : BIBLE_BOOKS.NEW_TESTAMENT;
        verses = verses.filter(v => testamentBooks.includes(v.book));
      }

      // Limit results
      verses = verses.slice(0, limit);

      // Add reference and relevance
      return verses.map((verse: any) => ({
        ...verse,
        reference: `${verse.book} ${verse.chapter}:${verse.verse}`,
        relevance: verse.rank || this.calculateRelevance(verse.text, query),
      }));
    } catch (error) {
      logger.error('Error searching Bible:', error);
      throw new Error('Failed to search Bible');
    }
  }

  async searchTopics(query: string, limit: number = 10): Promise<any[]> {
    try {
      const topics = await TopicModel.search(query, limit);
      
      // Enhance topics with verse counts
      const enhancedTopics = await Promise.all(
        topics.map(async (topic) => {
          if (topic.id) {
            const verses = await VerseModel.findByTopic(topic.id, 1);
            return {
              ...topic,
              verseCount: verses.length,
            };
          }
          return topic;
        })
      );

      return enhancedTopics;
    } catch (error) {
      logger.error('Error searching topics:', error);
      throw new Error('Failed to search topics');
    }
  }

  async searchCrossReferences(reference: string): Promise<string[]> {
    // This would query the cross_references table
    // For now, returning mock data
    const crossRefs: { [key: string]: string[] } = {
      'John 3:16': ['Romans 5:8', '1 John 4:9-10', 'Ephesians 2:4-5'],
      'Romans 8:28': ['Genesis 50:20', 'James 1:2-4', 'Ephesians 1:11'],
      'Philippians 4:6': ['1 Peter 5:7', 'Matthew 6:25-34', 'Psalms 55:22'],
    };

    return crossRefs[reference] || [];
  }

  async semanticSearch(query: string, limit: number = 10): Promise<VerseWithRelevance[]> {
    // This would implement semantic search using embeddings
    // For now, falling back to regular search
    return this.searchBible({ query, limit });
  }

  private calculateRelevance(text: string, query: string): number {
    // Simple relevance calculation based on word matches
    const queryWords = query.toLowerCase().split(/\s+/);
    const textWords = text.toLowerCase().split(/\s+/);
    
    let matches = 0;
    for (const queryWord of queryWords) {
      if (textWords.some(textWord => textWord.includes(queryWord))) {
        matches++;
      }
    }

    return Math.min(matches / queryWords.length, 1);
  }

  async findSimilarVerses(_verseId: number, limit: number = 5): Promise<Verse[]> {
    // This would use embeddings or topic similarity
    // For now, returning verses from the same book
    try {
      const verse = await VerseModel.findByReference('John', 3, 16);
      if (!verse) return [];

      const similarVerses = await VerseModel.findByBook(verse.book, verse.translation);
      return similarVerses.slice(0, limit);
    } catch (error) {
      logger.error('Error finding similar verses:', error);
      return [];
    }
  }

  async searchByKeywords(keywords: string[], operator: 'AND' | 'OR' = 'AND'): Promise<Verse[]> {
    try {
      if (keywords.length === 0) return [];

      // Build search query
      const searchQuery = operator === 'AND'
        ? keywords.join(' ')
        : keywords.join(' | ');

      const verses = await VerseModel.search(searchQuery, 20);
      return verses;
    } catch (error) {
      logger.error('Error searching by keywords:', error);
      throw new Error('Failed to search by keywords');
    }
  }
}