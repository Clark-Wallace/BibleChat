export const API_VERSION = 'v1';
export const API_PREFIX = `/api/${API_VERSION}`;

export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;

export const CACHE_TTL = {
  SHORT: 60,          // 1 minute
  MEDIUM: 300,        // 5 minutes
  LONG: 3600,         // 1 hour
  DAY: 86400,         // 24 hours
};

export const RATE_LIMITS = {
  FREE: {
    windowMs: 60 * 60 * 1000,  // 1 hour
    max: 100,
  },
  PAID: {
    windowMs: 60 * 60 * 1000,  // 1 hour
    max: 1000,
  },
  PREMIUM: {
    windowMs: 60 * 60 * 1000,  // 1 hour
    max: 10000,
  },
};

export const USER_TIERS = {
  FREE: 'free',
  PAID: 'paid',
  PREMIUM: 'premium',
} as const;

export const BIBLE_BOOKS = {
  OLD_TESTAMENT: [
    'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy',
    'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel',
    '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles',
    'Ezra', 'Nehemiah', 'Esther', 'Job', 'Psalms', 'Proverbs',
    'Ecclesiastes', 'Song of Solomon', 'Isaiah', 'Jeremiah',
    'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel',
    'Amos', 'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk',
    'Zephaniah', 'Haggai', 'Zechariah', 'Malachi'
  ],
  NEW_TESTAMENT: [
    'Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans',
    '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians',
    'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians',
    '1 Timothy', '2 Timothy', 'Titus', 'Philemon', 'Hebrews',
    'James', '1 Peter', '2 Peter', '1 John', '2 John', '3 John',
    'Jude', 'Revelation'
  ]
};

export const TRANSLATIONS = {
  NIV: 'New International Version',
  ESV: 'English Standard Version',
  KJV: 'King James Version',
  NLT: 'New Living Translation',
  NASB: 'New American Standard Bible',
  NKJV: 'New King James Version',
};

export const RESPONSE_MODES = {
  CONVERSATIONAL: 'conversational',
  STUDY: 'study',
  DEVOTIONAL: 'devotional',
  SIMPLE: 'simple',
} as const;

export const ERROR_MESSAGES = {
  INVALID_API_KEY: 'Invalid API key',
  RATE_LIMIT_EXCEEDED: 'Rate limit exceeded',
  INVALID_VERSE_REFERENCE: 'Invalid verse reference',
  VERSE_NOT_FOUND: 'Verse not found',
  INTERNAL_ERROR: 'Internal server error',
  INVALID_REQUEST: 'Invalid request parameters',
  DATABASE_ERROR: 'Database error occurred',
  AI_SERVICE_ERROR: 'AI service temporarily unavailable',
};