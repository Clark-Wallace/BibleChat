import { VerseService } from '../bible/verse.service';
import { SearchService } from '../bible/search.service';
import { VerseWithRelevance } from '../../models/types/response.types';
import logger from '../../utils/logger';

export class RAGService {
  private verseService: VerseService;
  private searchService: SearchService;

  constructor() {
    this.verseService = new VerseService();
    this.searchService = new SearchService();
  }

  async retrieveRelevantVerses(
    query: string,
    maxVerses: number = 5,
    translation: string = 'NIV'
  ): Promise<VerseWithRelevance[]> {
    try {
      // Extract key topics from the query
      const topics = this.extractTopics(query);
      
      // Search for verses using multiple strategies
      const [
        directSearch,
        topicVerses,
        keywordSearch
      ] = await Promise.all([
        // Direct text search
        this.verseService.searchVerses(query, Math.ceil(maxVerses / 2), translation),
        // Topic-based search
        this.searchByTopics(topics, Math.ceil(maxVerses / 3), translation),
        // Keyword search
        this.searchByKeywords(query, Math.ceil(maxVerses / 3), translation),
      ]);

      // Combine and deduplicate results
      const allVerses = [...directSearch, ...topicVerses, ...keywordSearch];
      const uniqueVerses = this.deduplicateVerses(allVerses);

      // Re-rank based on relevance to query
      const rankedVerses = this.rankVerses(uniqueVerses, query);

      // Return top N verses
      return rankedVerses.slice(0, maxVerses);
    } catch (error) {
      logger.error('Error retrieving relevant verses:', error);
      return [];
    }
  }

  async enhanceQueryWithContext(query: string): Promise<{
    enhancedQuery: string;
    topics: string[];
    keywords: string[];
  }> {
    // Extract biblical context from the query
    const topics = this.extractTopics(query);
    const keywords = this.extractKeywords(query);
    
    // Enhance the query with biblical terminology
    let enhancedQuery = query;
    
    // Add biblical context if certain keywords are found
    const contextMap: { [key: string]: string } = {
      'anxious': 'anxiety worry peace trust',
      'depressed': 'depression sadness hope joy comfort',
      'angry': 'anger forgiveness patience self-control',
      'afraid': 'fear courage strength faith',
      'lonely': 'loneliness companionship God\'s presence',
      'sick': 'healing health restoration prayer',
      'relationship': 'love marriage unity communication',
      'money': 'finances stewardship provision contentment',
      'work': 'labor diligence purpose calling',
      'family': 'parents children household unity',
    };

    for (const [key, context] of Object.entries(contextMap)) {
      if (query.toLowerCase().includes(key)) {
        enhancedQuery += ` ${context}`;
      }
    }

    return {
      enhancedQuery,
      topics,
      keywords,
    };
  }

  private async searchByTopics(
    topics: string[],
    limit: number,
    translation: string
  ): Promise<VerseWithRelevance[]> {
    if (topics.length === 0) return [];

    const versesPerTopic = Math.ceil(limit / topics.length);
    const topicVerses = await Promise.all(
      topics.map(topic => 
        this.verseService.getVersesByTopic(topic, versesPerTopic, translation)
      )
    );

    return topicVerses.flat();
  }

  private async searchByKeywords(
    query: string,
    limit: number,
    translation: string
  ): Promise<VerseWithRelevance[]> {
    const keywords = this.extractKeywords(query);
    if (keywords.length === 0) return [];

    return this.verseService.searchVerses(
      keywords.join(' '),
      limit,
      translation
    );
  }

  private extractTopics(query: string): string[] {
    const commonTopics = [
      'love', 'faith', 'hope', 'prayer', 'forgiveness',
      'peace', 'joy', 'wisdom', 'strength', 'healing',
      'salvation', 'grace', 'mercy', 'trust', 'patience',
      'kindness', 'compassion', 'truth', 'righteousness',
      'worship', 'praise', 'thanksgiving', 'humility',
      'courage', 'perseverance', 'discipline', 'obedience',
    ];

    const queryLower = query.toLowerCase();
    const foundTopics = commonTopics.filter(topic => 
      queryLower.includes(topic) || 
      queryLower.includes(topic.substring(0, topic.length - 1)) // Check singular forms
    );

    // Add related topics
    const relatedTopics: { [key: string]: string[] } = {
      'anxiety': ['peace', 'trust', 'faith'],
      'worry': ['peace', 'trust', 'faith'],
      'depression': ['hope', 'joy', 'comfort'],
      'anger': ['forgiveness', 'patience', 'love'],
      'fear': ['courage', 'faith', 'strength'],
      'marriage': ['love', 'unity', 'commitment'],
      'money': ['stewardship', 'contentment', 'provision'],
      'work': ['diligence', 'purpose', 'service'],
    };

    for (const [key, related] of Object.entries(relatedTopics)) {
      if (queryLower.includes(key)) {
        foundTopics.push(...related);
      }
    }

    return [...new Set(foundTopics)];
  }

  private extractKeywords(query: string): string[] {
    // Remove common words and extract meaningful keywords
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
      'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
      'could', 'should', 'may', 'might', 'must', 'can', 'what', 'how',
      'when', 'where', 'why', 'who', 'which', 'this', 'that', 'these',
      'those', 'i', 'me', 'my', 'we', 'us', 'our', 'you', 'your',
    ]);

    const words = query.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.has(word));

    return [...new Set(words)];
  }

  private deduplicateVerses(verses: VerseWithRelevance[]): VerseWithRelevance[] {
    const seen = new Set<string>();
    const unique: VerseWithRelevance[] = [];

    for (const verse of verses) {
      const key = `${verse.book}-${verse.chapter}-${verse.verse}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(verse);
      }
    }

    return unique;
  }

  private rankVerses(
    verses: VerseWithRelevance[],
    query: string
  ): VerseWithRelevance[] {
    const queryLower = query.toLowerCase();
    const queryWords = this.extractKeywords(query);

    return verses.map(verse => {
      let score = verse.relevance || 0.5;
      const verseLower = verse.text.toLowerCase();

      // Boost score for exact phrase matches
      if (verseLower.includes(queryLower)) {
        score += 0.3;
      }

      // Boost score for keyword matches
      const matchedKeywords = queryWords.filter(word => 
        verseLower.includes(word)
      );
      score += (matchedKeywords.length / queryWords.length) * 0.2;

      // Boost popular verses slightly
      const popularVerses = ['John 3:16', 'Philippians 4:13', 'Romans 8:28'];
      if (popularVerses.includes(verse.reference)) {
        score += 0.1;
      }

      return {
        ...verse,
        relevance: Math.min(1, score),
      };
    }).sort((a, b) => b.relevance - a.relevance);
  }

  async getCrossReferences(verseReference: string): Promise<string[]> {
    return this.searchService.searchCrossReferences(verseReference);
  }
}