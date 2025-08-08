/**
 * Type definitions for BibleChat module
 */

export interface BibleVerse {
  id?: string;
  book: string;
  chapter: number;
  verse: number;
  text: string;
  translation: string;
  reference: string;
  testament?: 'OT' | 'NT';
}

export interface ChatOptions {
  mode?: 'conversational' | 'study' | 'devotional' | 'counseling';
  translation?: string;
  maxVerses?: number;
  includeContext?: boolean;
  temperature?: number;
}

export interface SearchOptions {
  limit?: number;
  translation?: string;
  book?: string;
  testament?: 'OT' | 'NT';
  exactMatch?: boolean;
}

export interface BibleChatConfig {
  openAIKey?: string;
  defaultTranslation?: string;
  customBibleData?: BibleVerse[];
  cacheEnabled?: boolean;
  offlineMode?: boolean;
}

export interface ChatResponse {
  response: string;
  verses: BibleVerse[];
  confidence: number;
  metadata?: {
    tokensUsed?: number;
    model?: string;
    timestamp?: Date;
  };
}

export interface DailyVerse {
  verse: BibleVerse;
  reflection: string;
  prayer?: string;
  application?: string;
}

export interface TopicResult {
  topic: string;
  verses: BibleVerse[];
  summary?: string;
}