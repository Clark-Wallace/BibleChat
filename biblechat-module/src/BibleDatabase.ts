/**
 * Embedded Bible Database
 * Contains the complete Bible in memory for offline access
 */

import { BibleVerse } from './types';
// In production, this would import from a compressed JSON file
// import bibleData from '../data/bible-min.json';

export class BibleDatabase {
  private verses: Map<string, BibleVerse>;
  private bookIndex: Map<string, Set<number>>;
  private topicIndex: Map<string, Set<string>>;
  
  constructor(customData?: BibleVerse[]) {
    this.verses = new Map();
    this.bookIndex = new Map();
    this.topicIndex = new Map();
    
    // Load Bible data
    this.loadBibleData(customData || this.getDefaultBibleData());
    this.buildIndexes();
  }

  /**
   * Get a specific verse
   */
  getVerse(book: string, chapter: number, verse: number): BibleVerse | null {
    const key = `${book.toLowerCase()}_${chapter}_${verse}`;
    return this.verses.get(key) || null;
  }

  /**
   * Get all verses
   */
  getAllVerses(): BibleVerse[] {
    return Array.from(this.verses.values());
  }

  /**
   * Get random verse
   */
  getRandomVerse(): BibleVerse {
    const verses = Array.from(this.verses.values());
    return verses[Math.floor(Math.random() * verses.length)];
  }

  /**
   * Get all books
   */
  getAllBooks(): string[] {
    return Array.from(this.bookIndex.keys());
  }

  /**
   * Get chapters in a book
   */
  getChapters(book: string): number[] {
    const chapters = this.bookIndex.get(book.toLowerCase());
    return chapters ? Array.from(chapters).sort((a, b) => a - b) : [];
  }

  /**
   * Search verses by text
   */
  searchByText(query: string, limit: number = 20): BibleVerse[] {
    const results: BibleVerse[] = [];
    const searchTerm = query.toLowerCase();
    
    for (const verse of this.verses.values()) {
      if (verse.text.toLowerCase().includes(searchTerm)) {
        results.push(verse);
        if (results.length >= limit) break;
      }
    }
    
    return results;
  }

  /**
   * Get verses by topic
   */
  getVersesByTopic(topic: string): BibleVerse[] {
    const verseIds = this.topicIndex.get(topic.toLowerCase());
    if (!verseIds) return [];
    
    return Array.from(verseIds)
      .map(id => this.verses.get(id))
      .filter(v => v !== undefined) as BibleVerse[];
  }

  /**
   * Load Bible data into memory
   */
  private loadBibleData(data: BibleVerse[]): void {
    for (const verse of data) {
      const key = `${verse.book.toLowerCase()}_${verse.chapter}_${verse.verse}`;
      this.verses.set(key, {
        ...verse,
        reference: `${verse.book} ${verse.chapter}:${verse.verse}`,
        translation: verse.translation || 'KJV'
      });
    }
  }

  /**
   * Build search indexes
   */
  private buildIndexes(): void {
    for (const [key, verse] of this.verses.entries()) {
      // Book index
      const bookKey = verse.book.toLowerCase();
      if (!this.bookIndex.has(bookKey)) {
        this.bookIndex.set(bookKey, new Set());
      }
      this.bookIndex.get(bookKey)!.add(verse.chapter);
      
      // Topic index (simplified - in production would use NLP)
      const topics = this.extractTopics(verse.text);
      for (const topic of topics) {
        if (!this.topicIndex.has(topic)) {
          this.topicIndex.set(topic, new Set());
        }
        this.topicIndex.get(topic)!.add(key);
      }
    }
  }

  /**
   * Extract topics from verse text
   */
  private extractTopics(text: string): string[] {
    const topicKeywords = {
      'love': ['love', 'loved', 'loves', 'loving', 'beloved'],
      'faith': ['faith', 'faithful', 'believe', 'belief', 'trust'],
      'hope': ['hope', 'hoped', 'hoping', 'hopeful'],
      'peace': ['peace', 'peaceful', 'calm', 'rest'],
      'joy': ['joy', 'joyful', 'rejoice', 'happy', 'gladness'],
      'prayer': ['pray', 'prayer', 'prayed', 'praying'],
      'forgiveness': ['forgive', 'forgiven', 'forgiveness', 'pardon'],
      'salvation': ['save', 'saved', 'salvation', 'redeem', 'redemption'],
      'wisdom': ['wisdom', 'wise', 'understanding', 'knowledge'],
      'strength': ['strength', 'strong', 'mighty', 'power', 'courage']
    };
    
    const topics: string[] = [];
    const lowerText = text.toLowerCase();
    
    for (const [topic, keywords] of Object.entries(topicKeywords)) {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        topics.push(topic);
      }
    }
    
    return topics;
  }

  /**
   * Get sample Bible data (subset for demo)
   */
  private getDefaultBibleData(): BibleVerse[] {
    // In production, this would load from a compressed JSON file
    // For demo, returning a small subset
    return [
      {
        book: 'John',
        chapter: 3,
        verse: 16,
        text: 'For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.',
        translation: 'KJV',
        reference: 'John 3:16',
        testament: 'NT'
      },
      {
        book: 'Psalms',
        chapter: 23,
        verse: 1,
        text: 'The LORD is my shepherd; I shall not want.',
        translation: 'KJV',
        reference: 'Psalms 23:1',
        testament: 'OT'
      },
      {
        book: 'Philippians',
        chapter: 4,
        verse: 13,
        text: 'I can do all things through Christ which strengtheneth me.',
        translation: 'KJV',
        reference: 'Philippians 4:13',
        testament: 'NT'
      },
      {
        book: 'Proverbs',
        chapter: 3,
        verse: 5,
        text: 'Trust in the LORD with all thine heart; and lean not unto thine own understanding.',
        translation: 'KJV',
        reference: 'Proverbs 3:5',
        testament: 'OT'
      },
      {
        book: 'Romans',
        chapter: 8,
        verse: 28,
        text: 'And we know that all things work together for good to them that love God, to them who are the called according to his purpose.',
        translation: 'KJV',
        reference: 'Romans 8:28',
        testament: 'NT'
      }
      // In production, all 31,100+ verses would be loaded here
    ];
  }
}