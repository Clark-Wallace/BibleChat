export interface Verse {
  id?: number;
  book: string;
  chapter: number;
  verse: number;
  text: string;
  translation: string;
  testament: 'OT' | 'NT';
}

export interface VerseWithRelevance extends Verse {
  reference: string;
  relevance: number;
}

export interface ChatResponse {
  response: string;
  verses: VerseWithRelevance[];
  followUpQuestions: string[];
  relatedTopics: string[];
  conversationId: string;
  metadata: {
    confidence: number;
    tokensUsed: number;
    responseTime: number;
  };
}

export interface VerseExplainResponse {
  verse: Verse & { reference: string };
  explanation: string;
  context?: string;
  application: string;
  crossReferences: string[];
  originalLanguage?: {
    greek?: string;
    hebrew?: string;
    transliteration?: string;
  };
}

export interface TopicResponse {
  topic: string;
  overview: string;
  keyVerses: VerseWithRelevance[];
  subtopics: string[];
  practicalSteps: string[];
  commonQuestions: Array<{
    question: string;
    answer: string;
  }>;
}

export interface CounselResponse {
  guidance: string;
  relevantVerses: VerseWithRelevance[];
  practicalSteps: string[];
  prayerSuggestion: string;
  disclaimer: string;
  resources: Array<{
    title: string;
    type: string;
    description: string;
  }>;
}

export interface DailyVerseResponse {
  verse: Verse & { reference: string };
  reflection: string;
  prayer: string;
  application: string;
}

export interface ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
  timestamp: string;
  path?: string;
}

export interface SuccessResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ApiUsageResponse {
  apiKey: string;
  tier: string;
  monthlyLimit: number;
  currentUsage: number;
  remainingCalls: number;
  resetDate: Date;
}