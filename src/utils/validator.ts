import Joi from 'joi';
import { BIBLE_BOOKS, TRANSLATIONS, RESPONSE_MODES } from './constants';

const allBooks = [...BIBLE_BOOKS.OLD_TESTAMENT, ...BIBLE_BOOKS.NEW_TESTAMENT];

export const chatRequestSchema = Joi.object({
  message: Joi.string().min(1).max(1000).required(),
  context: Joi.string().max(500).optional(),
  conversationId: Joi.string().uuid().optional(),
  mode: Joi.string().valid(...Object.values(RESPONSE_MODES)).default('conversational'),
  translation: Joi.string().valid(...Object.keys(TRANSLATIONS)).default('NIV'),
  includeCommentary: Joi.boolean().default(false),
  maxVerses: Joi.number().integer().min(1).max(10).default(5),
});

export const verseExplainRequestSchema = Joi.object({
  reference: Joi.string().required().pattern(/^[1-3]?\s?[A-Za-z]+\s+\d+:\d+(-\d+)?$/),
  depth: Joi.string().valid('simple', 'moderate', 'scholarly').default('moderate'),
  includeContext: Joi.boolean().default(true),
  includeGreek: Joi.boolean().default(false),
  translation: Joi.string().valid(...Object.keys(TRANSLATIONS)).default('NIV'),
});

export const counselRequestSchema = Joi.object({
  situation: Joi.string().min(10).max(1000).required(),
  category: Joi.string().optional(),
  specificIssues: Joi.array().items(Joi.string()).max(5).optional(),
  denomination: Joi.string().optional(),
});

export const topicRequestSchema = Joi.object({
  depth: Joi.string().valid('basic', 'comprehensive').default('basic'),
  limit: Joi.number().integer().min(1).max(20).default(10),
  translation: Joi.string().valid(...Object.keys(TRANSLATIONS)).default('NIV'),
});

export const dailyVerseRequestSchema = Joi.object({
  mood: Joi.string().max(50).optional(),
  situation: Joi.string().max(200).optional(),
  translation: Joi.string().valid(...Object.keys(TRANSLATIONS)).default('NIV'),
});

export const verseReferenceParser = (reference: string): {
  book: string;
  chapter: number;
  verseStart: number;
  verseEnd?: number;
} | null => {
  const pattern = /^([1-3]?\s?[A-Za-z]+)\s+(\d+):(\d+)(?:-(\d+))?$/;
  const match = reference.trim().match(pattern);
  
  if (!match) return null;
  
  const [, book, chapter, verseStart, verseEnd] = match;
  const normalizedBook = book.trim();
  
  const validBook = allBooks.find(b => 
    b.toLowerCase() === normalizedBook.toLowerCase()
  );
  
  if (!validBook) return null;
  
  return {
    book: validBook,
    chapter: parseInt(chapter, 10),
    verseStart: parseInt(verseStart, 10),
    verseEnd: verseEnd ? parseInt(verseEnd, 10) : undefined,
  };
};

export const validateApiKey = (apiKey: string): boolean => {
  return /^[A-Za-z0-9+/=]{32,64}$/.test(apiKey);
};

export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim();
};