export interface ChatRequest {
  message: string;
  context?: string;
  conversationId?: string;
  mode: 'conversational' | 'study' | 'devotional' | 'simple';
  translation: string;
  includeCommentary: boolean;
  maxVerses: number;
}

export interface VerseExplainRequest {
  reference: string;
  depth: 'simple' | 'moderate' | 'scholarly';
  includeContext: boolean;
  includeGreek: boolean;
  translation: string;
}

export interface CounselRequest {
  situation: string;
  category?: string;
  specificIssues?: string[];
  denomination?: string;
}

export interface TopicRequest {
  topic: string;
  depth: 'basic' | 'comprehensive';
  limit: number;
  translation: string;
}

export interface DailyVerseRequest {
  mood?: string;
  situation?: string;
  translation: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface SearchParams {
  query: string;
  book?: string;
  testament?: 'old' | 'new';
  translation?: string;
  limit?: number;
}