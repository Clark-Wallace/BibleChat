/**
 * BibleChat Standalone Module
 * A lightweight module for integrating Bible chat into any application
 */

import { BibleVerse, ChatOptions, SearchOptions, BibleChatConfig } from './types';
import { BibleDatabase } from './BibleDatabase';
import { AIChat } from './AIChat';
import { VerseSearch } from './VerseSearch';

export class BibleChat {
  private db: BibleDatabase;
  private ai: AIChat | null = null;
  private search: VerseSearch;

  constructor(config?: BibleChatConfig) {
    // Initialize with embedded Bible data
    this.db = new BibleDatabase(config?.customBibleData);
    this.search = new VerseSearch(this.db);
    
    // Initialize AI if API key provided
    if (config?.openAIKey) {
      this.ai = new AIChat(config.openAIKey, this.db);
    }
  }

  /**
   * Chat with the Bible using AI
   * Requires OpenAI API key
   */
  async chat(message: string, options?: ChatOptions): Promise<{
    response: string;
    verses: BibleVerse[];
    confidence: number;
  }> {
    if (!this.ai) {
      throw new Error('OpenAI API key required for chat. Initialize with: new BibleChat({ openAIKey: "sk-..." })');
    }

    // Get relevant verses
    const verses = await this.search.findRelevantVerses(message, options?.maxVerses || 5);
    
    // Generate AI response with context
    const response = await this.ai.generateResponse(message, verses, options);
    
    return {
      response,
      verses,
      confidence: 0.95
    };
  }

  /**
   * Search for verses (no AI required)
   */
  async searchVerses(query: string, options?: SearchOptions): Promise<{
    results: BibleVerse[];
    total: number;
  }> {
    const results = await this.search.search(query, options);
    return {
      results,
      total: results.length
    };
  }

  /**
   * Get a specific verse
   */
  async getVerse(book: string, chapter: number, verse: number): Promise<BibleVerse | null> {
    return this.db.getVerse(book, chapter, verse);
  }

  /**
   * Get daily verse
   */
  async getDailyVerse(): Promise<{
    verse: BibleVerse;
    reflection: string;
  }> {
    const verse = this.db.getRandomVerse();
    const reflection = this.generateReflection(verse);
    
    return {
      verse,
      reflection
    };
  }

  /**
   * Get verses by topic
   */
  async getVersesByTopic(topic: string, limit: number = 10): Promise<BibleVerse[]> {
    return this.search.searchByTopic(topic, limit);
  }

  /**
   * Get verse explanation (requires AI)
   */
  async explainVerse(verse: BibleVerse, depth: 'simple' | 'moderate' | 'deep' = 'moderate'): Promise<string> {
    if (!this.ai) {
      // Provide basic explanation without AI
      return this.getBasicExplanation(verse);
    }
    
    return this.ai.explainVerse(verse, depth);
  }

  /**
   * Check if AI is available
   */
  hasAI(): boolean {
    return this.ai !== null;
  }

  /**
   * Get all books in the Bible
   */
  getBooks(): string[] {
    return this.db.getAllBooks();
  }

  /**
   * Get chapters in a book
   */
  getChapters(book: string): number[] {
    return this.db.getChapters(book);
  }

  // Private helper methods
  private generateReflection(verse: BibleVerse): string {
    const reflections = [
      `This verse reminds us of God's eternal ${this.extractTheme(verse.text)}.`,
      `Reflect on how ${verse.reference} speaks to your current situation.`,
      `Consider the wisdom in these words and how they apply to your life today.`,
      `Let this scripture guide your thoughts and actions throughout the day.`
    ];
    
    return reflections[Math.floor(Math.random() * reflections.length)];
  }

  private extractTheme(text: string): string {
    const themes = ['love', 'grace', 'wisdom', 'strength', 'peace', 'hope', 'faith'];
    const lowercaseText = text.toLowerCase();
    
    for (const theme of themes) {
      if (lowercaseText.includes(theme)) {
        return theme;
      }
    }
    
    return 'wisdom';
  }

  private getBasicExplanation(verse: BibleVerse): string {
    return `${verse.reference} teaches us about the importance of faith and spiritual growth. This verse from ${verse.book} provides guidance for our daily walk with God.`;
  }
}

// Export types and utilities
export * from './types';
export { BibleDatabase } from './BibleDatabase';
export { VerseSearch } from './VerseSearch';
export { AIChat } from './AIChat';

// Default export for easy importing
export default BibleChat;