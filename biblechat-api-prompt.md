# BibleChat API - Complete Development Prompt for Claude Code

## Project Overview

Build a production-ready REST API service called "BibleChat API" that allows applications to have AI-powered conversations with Biblical scripture. This is a standalone microservice that will provide natural language Bible interactions through API endpoints, designed to be integrated into various Christian applications, starting with our Spiritual Journey Journal app.

## Core Requirements

### What You're Building
A Node.js/TypeScript API service that:
1. Accepts natural language questions about the Bible
2. Returns theologically accurate, verse-backed responses
3. Provides conversational, contextual guidance based on Scripture
4. Operates as a monetized API service with usage tiers
5. Integrates easily with any application via REST endpoints

### Critical Constraints
- **MUST** only cite real Bible verses (never fabricate)
- **MUST** remain theologically neutral (non-denominational Christian)
- **MUST** include verse references for all biblical claims
- **MUST** handle sensitive topics with appropriate disclaimers
- **MUST** work offline-first with cached Bible data
- **MUST** respond in under 2 seconds

## Technical Stack

```yaml
Backend Framework: Node.js with Express.js
Language: TypeScript (strict mode)
Database: PostgreSQL for verses, Redis for caching
AI Integration: OpenAI GPT-4 API with RAG (Retrieval-Augmented Generation)
Bible Data: Store locally, don't rely on external Bible APIs
Authentication: JWT with API keys
Testing: Jest with 80% coverage minimum
Documentation: OpenAPI/Swagger auto-generated
Deployment: Docker container ready for cloud deployment
```

## Project Structure

```
biblechat-api/
├── src/
│   ├── api/
│   │   ├── controllers/
│   │   │   ├── chat.controller.ts       # Main conversation endpoint
│   │   │   ├── verse.controller.ts      # Verse lookup/explain
│   │   │   ├── topics.controller.ts     # Topic exploration
│   │   │   └── counsel.controller.ts    # Biblical counseling
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts       # API key validation
│   │   │   ├── rateLimit.middleware.ts  # Usage limiting
│   │   │   └── error.middleware.ts      # Error handling
│   │   └── routes/
│   │       └── v1/
│   │           └── index.ts             # Route definitions
│   ├── services/
│   │   ├── ai/
│   │   │   ├── chatGPT.service.ts      # OpenAI integration
│   │   │   ├── rag.service.ts          # Retrieval-augmented generation
│   │   │   └── validation.service.ts    # Theological validation
│   │   ├── bible/
│   │   │   ├── verse.service.ts        # Verse retrieval
│   │   │   ├── search.service.ts       # Scripture searching
│   │   │   └── context.service.ts      # Biblical context
│   │   └── cache/
│   │       └── redis.service.ts        # Response caching
│   ├── models/
│   │   ├── database/
│   │   │   ├── verse.model.ts          # Bible verses
│   │   │   ├── topic.model.ts          # Topical index
│   │   │   └── usage.model.ts          # API usage tracking
│   │   └── types/
│   │       ├── request.types.ts        # Request interfaces
│   │       └── response.types.ts       # Response interfaces
│   ├── data/
│   │   ├── loaders/
│   │   │   └── bibleLoader.ts          # Import Bible data
│   │   └── seeds/
│   │       └── verses.json             # Initial Bible data
│   ├── utils/
│   │   ├── logger.ts                   # Winston logging
│   │   ├── validator.ts                # Input validation
│   │   └── constants.ts                # App constants
│   └── app.ts                          # Express app setup
├── tests/
│   ├── unit/
│   ├── integration/
│   └── fixtures/
├── docs/
│   └── swagger.yaml                    # API documentation
├── docker/
│   └── Dockerfile
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

## Database Schema

```sql
-- Bible verses table
CREATE TABLE verses (
  id SERIAL PRIMARY KEY,
  book VARCHAR(50) NOT NULL,
  chapter INTEGER NOT NULL,
  verse INTEGER NOT NULL,
  text TEXT NOT NULL,
  translation VARCHAR(10) DEFAULT 'NIV',
  testament VARCHAR(3) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_book_chapter_verse (book, chapter, verse),
  INDEX idx_full_text (text gin_trgm_ops),
  UNIQUE KEY unique_verse (book, chapter, verse, translation)
);

-- Topical index
CREATE TABLE topics (
  id SERIAL PRIMARY KEY,
  topic VARCHAR(100) NOT NULL UNIQUE,
  category VARCHAR(50),
  related_topics TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);

-- Topic-verse relationships
CREATE TABLE topic_verses (
  topic_id INTEGER REFERENCES topics(id),
  verse_id INTEGER REFERENCES verses(id),
  relevance_score DECIMAL(3,2),
  PRIMARY KEY (topic_id, verse_id)
);

-- Cross references
CREATE TABLE cross_references (
  verse_id INTEGER REFERENCES verses(id),
  referenced_verse_id INTEGER REFERENCES verses(id),
  reference_type VARCHAR(20),
  PRIMARY KEY (verse_id, referenced_verse_id)
);

-- API usage tracking
CREATE TABLE api_usage (
  id SERIAL PRIMARY KEY,
  api_key VARCHAR(64) NOT NULL,
  endpoint VARCHAR(100),
  tokens_used INTEGER,
  response_time_ms INTEGER,
  status_code INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_api_key_date (api_key, created_at)
);

-- API keys
CREATE TABLE api_keys (
  id SERIAL PRIMARY KEY,
  key VARCHAR(64) UNIQUE NOT NULL,
  name VARCHAR(100),
  tier VARCHAR(20) DEFAULT 'free',
  monthly_limit INTEGER,
  current_usage INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true
);

-- Conversation history (optional, for context)
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key VARCHAR(64),
  messages JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## API Endpoints

### 1. Main Chat Endpoint
```typescript
POST /api/v1/chat
Headers: 
  Authorization: Bearer {API_KEY}
  Content-Type: application/json

Request Body:
{
  "message": "What does the Bible say about anxiety?",
  "context": "I'm worried about my job interview tomorrow",
  "conversationId": "uuid (optional)",
  "mode": "conversational" | "study" | "devotional" | "simple",
  "translation": "NIV" | "ESV" | "KJV" | "NLT",
  "includeCommentary": false,
  "maxVerses": 5
}

Response:
{
  "response": "The Bible speaks directly to anxiety...",
  "verses": [
    {
      "reference": "Philippians 4:6-7",
      "text": "Do not be anxious about anything...",
      "translation": "NIV",
      "relevance": 0.95
    }
  ],
  "followUpQuestions": [
    "Would you like to know how to pray about this?",
    "Can I share what Jesus said about worry?"
  ],
  "relatedTopics": ["peace", "trust", "prayer"],
  "conversationId": "uuid",
  "metadata": {
    "confidence": 0.92,
    "tokensUsed": 450,
    "responseTime": 1250
  }
}
```

### 2. Verse Explanation
```typescript
POST /api/v1/verses/explain
Request:
{
  "reference": "Romans 8:28",
  "depth": "simple" | "moderate" | "scholarly",
  "includeContext": true,
  "includeGreek": false
}

Response:
{
  "verse": { reference, text },
  "explanation": "This verse means...",
  "context": "Paul wrote this to the church in Rome...",
  "application": "In your life today, this means...",
  "crossReferences": ["Genesis 50:20", "James 1:2-4"]
}
```

### 3. Topic Exploration
```typescript
GET /api/v1/topics/{topic}
Parameters:
  - depth: basic | comprehensive
  - limit: number of verses

Response:
{
  "topic": "forgiveness",
  "overview": "The Bible teaches that forgiveness...",
  "keyVerses": [...],
  "subtopics": ["God's forgiveness", "forgiving others", "self-forgiveness"],
  "practicalSteps": [...],
  "commonQuestions": [...]
}
```

### 4. Biblical Counseling
```typescript
POST /api/v1/counsel
Request:
{
  "situation": "My marriage is struggling",
  "category": "marriage",
  "specificIssues": ["communication", "trust"],
  "denomination": "none" | "baptist" | "catholic" | etc
}

Response:
{
  "guidance": "Scripture provides wisdom for marriage...",
  "relevantVerses": [...],
  "practicalSteps": [...],
  "prayerSuggestion": "...",
  "disclaimer": "Consider speaking with your pastor...",
  "resources": [...]
}
```

### 5. Daily Verse
```typescript
GET /api/v1/daily
Parameters:
  - mood: optional
  - situation: optional

Response:
{
  "verse": { reference, text },
  "reflection": "Today, consider how this verse...",
  "prayer": "Lord, help us to...",
  "application": "One way to apply this today..."
}
```

## Core Implementation Details

### AI Integration Service
```typescript
// src/services/ai/chatGPT.service.ts
import { Configuration, OpenAIApi } from 'openai';

export class ChatGPTService {
  private openai: OpenAIApi;
  private systemPrompt = `
    You are a biblical counselor AI that provides scripturally accurate responses.
    Rules:
    1. ONLY cite actual Bible verses that exist
    2. Always provide verse references
    3. Remain non-denominational unless specified
    4. Be compassionate and understanding
    5. Include practical application
    6. Never claim to be God or speak for God directly
    7. Suggest pastoral counseling for serious issues
    8. If unsure, say so - never fabricate verses
  `;

  async generateResponse(
    question: string, 
    context: string, 
    relevantVerses: Verse[]
  ): Promise<AIResponse> {
    // Implementation with RAG pattern
    // 1. Use relevantVerses as context
    // 2. Generate response with GPT-4
    // 3. Validate all verse citations
    // 4. Return structured response
  }
}
```

### Bible Service Implementation
```typescript
// src/services/bible/verse.service.ts
export class VerseService {
  async searchVerses(query: string, limit: number = 5): Promise<Verse[]> {
    // Use PostgreSQL full-text search
    const sql = `
      SELECT * FROM verses
      WHERE to_tsvector('english', text) @@ plainto_tsquery('english', $1)
      ORDER BY ts_rank(to_tsvector('english', text), plainto_tsquery('english', $1)) DESC
      LIMIT $2
    `;
    // Return matching verses
  }

  async getVersesByTopic(topic: string): Promise<Verse[]> {
    // Get verses from topical index
  }

  async getVerseByReference(reference: string): Promise<Verse> {
    // Parse reference (e.g., "John 3:16")
    // Fetch from database
  }
}
```

### Theological Validation
```typescript
// src/services/ai/validation.service.ts
export class ValidationService {
  async validateResponse(response: AIResponse): Promise<ValidationResult> {
    // 1. Check all verse references exist
    // 2. Verify verses match claimed content
    // 3. Check for theological red flags
    // 4. Ensure appropriate disclaimers included
    return {
      isValid: boolean,
      issues: string[],
      corrections: string[]
    };
  }
}
```

### Rate Limiting and Authentication
```typescript
// src/middleware/auth.middleware.ts
export async function authenticateAPIKey(req, res, next) {
  const apiKey = req.headers.authorization?.replace('Bearer ', '');
  
  if (!apiKey) {
    return res.status(401).json({ error: 'API key required' });
  }

  const keyData = await getAPIKeyData(apiKey);
  
  if (!keyData || !keyData.is_active) {
    return res.status(401).json({ error: 'Invalid API key' });
  }

  if (keyData.current_usage >= keyData.monthly_limit) {
    return res.status(429).json({ error: 'Monthly limit exceeded' });
  }

  req.apiKey = keyData;
  next();
}
```

## Testing Requirements

### Unit Tests (Jest)
```typescript
// tests/unit/services/verse.service.test.ts
describe('VerseService', () => {
  describe('searchVerses', () => {
    it('should return relevant verses for query', async () => {
      const verses = await verseService.searchVerses('love');
      expect(verses).toHaveLength(5);
      expect(verses[0].text).toContain('love');
    });

    it('should handle verse references', async () => {
      const verse = await verseService.getVerseByReference('John 3:16');
      expect(verse.book).toBe('John');
      expect(verse.chapter).toBe(3);
      expect(verse.verse).toBe(16);
    });
  });
});
```

### Integration Tests
```typescript
// tests/integration/chat.test.ts
describe('Chat API', () => {
  it('should provide biblical response with verses', async () => {
    const response = await request(app)
      .post('/api/v1/chat')
      .set('Authorization', `Bearer ${testApiKey}`)
      .send({
        message: 'What does the Bible say about love?',
        mode: 'conversational'
      });

    expect(response.status).toBe(200);
    expect(response.body.verses).toBeInstanceOf(Array);
    expect(response.body.verses.length).toBeGreaterThan(0);
    expect(response.body.response).toContain('love');
  });
});
```

## Environment Configuration

```env
# .env.example
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/biblechat
REDIS_URL=redis://localhost:6379

# OpenAI
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4
OPENAI_MAX_TOKENS=1000

# API Configuration
JWT_SECRET=your-secret-key
API_RATE_LIMIT_FREE=1000
API_RATE_LIMIT_PAID=10000

# Bible Data
DEFAULT_TRANSLATION=NIV
ENABLE_MULTIPLE_TRANSLATIONS=false

# Monitoring
SENTRY_DSN=https://...
LOG_LEVEL=info
```

## Performance Requirements

1. **Response Time**: < 2 seconds for chat endpoint
2. **Concurrent Users**: Handle 100 concurrent requests
3. **Uptime**: 99.9% availability
4. **Caching**: Cache common queries for 1 hour
5. **Database**: Index all searchable fields
6. **Rate Limiting**: Implement sliding window rate limiting

## Security Requirements

1. **API Keys**: Secure generation and storage (bcrypt)
2. **Input Validation**: Sanitize all inputs against injection
3. **HTTPS Only**: Enforce TLS 1.3
4. **CORS**: Configure for allowed origins only
5. **Logging**: Log all API usage without sensitive data
6. **Error Handling**: Never expose internal errors to clients

## Deployment Instructions

### Docker Setup
```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

### Docker Compose
```yaml
# docker-compose.yml
version: '3.8'
services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/biblechat
      - REDIS_URL=redis://cache:6379
    depends_on:
      - db
      - cache
  
  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=biblechat
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
  
  cache:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

## Initial Bible Data

Load the King James Version (public domain) or another open-source translation:
1. Download from https://github.com/scrollmapper/bible_databases
2. Import into PostgreSQL using the provided loader script
3. Build topical index using standard references
4. Create cross-references from standard study Bible data

## API Documentation

Generate OpenAPI/Swagger documentation:
```typescript
// src/docs/swagger.ts
import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'BibleChat API',
      version: '1.0.0',
      description: 'AI-powered Biblical conversation API',
    },
    servers: [
      { url: 'https://api.biblechat.ai/v1' }
    ],
  },
  apis: ['./src/api/routes/*.ts'],
};

export const specs = swaggerJsdoc(options);
```

## Monitoring and Analytics

Implement tracking for:
1. API usage per key
2. Popular queries/topics
3. Response times
4. Error rates
5. Verse citation accuracy
6. User satisfaction (optional feedback)

## Success Criteria

The implementation is complete when:
1. All 5 main endpoints are functional
2. Test coverage exceeds 80%
3. Response time is under 2 seconds
4. Bible verse citations are 100% accurate
5. API documentation is complete
6. Docker deployment works
7. Rate limiting is functional
8. 100 test queries produce theologically sound responses

## Additional Features for Future

After MVP is complete and working:
1. Multi-language support (Spanish, Portuguese, Chinese)
2. Audio responses (text-to-speech)
3. Webhook integrations
4. Biblical Greek/Hebrew word studies
5. Denominational perspective modes
6. Bible reading plan generation
7. Scripture memorization API
8. Prayer generation endpoint

## Error Handling Examples

```typescript
// Theological sensitivity
if (question.includes('suicide') || question.includes('self-harm')) {
  return {
    response: "I'm concerned about you. Please reach out to a pastor, counselor, or call 988 (Suicide & Crisis Lifeline). God loves you and your life has value.",
    verses: [
      { reference: "Psalm 34:18", text: "The Lord is close to the brokenhearted..." }
    ],
    resources: ["988 Lifeline", "Local pastor", "Christian counselor"]
  };
}

// Controversial topics
if (isControversialTopic(topic)) {
  return {
    response: "Christians hold different biblical views on this topic. Here are the main perspectives...",
    disclaimer: "Please discuss with your spiritual leaders for guidance specific to your faith tradition."
  };
}
```

## Final Notes

Build this incrementally:
1. Start with basic verse lookup
2. Add AI chat functionality
3. Implement caching and optimization
4. Add advanced features
5. Deploy and monitor

Remember: The goal is to provide biblical guidance that is accurate, helpful, and theologically sound while being accessible through a simple API that any Christian app can integrate.

---

**IMPORTANT**: Never fabricate Bible verses. If a verse reference cannot be found, return an error rather than generating fake scripture. This is the most critical requirement of the entire system.