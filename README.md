# 📖 BibleChat: Talk To The Bible

**An AI-powered REST API that enables natural conversations with the Bible, providing theologically accurate responses backed by authentic scripture references.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4-orange)](https://openai.com)

## 🌟 Description

BibleChat is a modern REST API that bridges ancient wisdom with cutting-edge AI technology. It allows developers to integrate biblical conversations into their applications, providing users with an intuitive way to explore scripture, receive guidance, and deepen their spiritual understanding.

### Key Features:
- **AI-Powered Conversations**: Natural language processing for biblical Q&A
- **100% Scripture-Backed**: Every response includes verified Bible verses
- **31,100+ Verses**: Complete Bible database (KJV, NIV, ESV, and more)
- **Theological Validation**: Prevents AI hallucination with built-in verse verification
- **Multiple Modes**: Conversational, study, devotional, and counseling modes
- **RAG Technology**: Retrieval-Augmented Generation for accurate context
- **Beautiful UI**: Illuminated Sanctuary theme with cathedral-inspired design

## 🎯 Use Cases

- **Spiritual Journey Apps**: Add a "Talk to the Bible" feature
- **Bible Study Tools**: Enhance study apps with AI insights
- **Devotional Applications**: Daily verses with AI-generated reflections
- **Educational Platforms**: Interactive biblical learning
- **Counseling Services**: Scripture-based guidance systems
- **Church Websites**: Interactive Bible chat widgets

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database (or free Supabase account)
- OpenAI API key

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/biblechat-api.git
cd biblechat-api

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your credentials

# Run database migrations
npm run db:migrate

# Seed the Bible data
npm run db:seed

# Start the development server
npm run dev
```

API will be available at `http://localhost:3000`

### Quick Test

```bash
# Get daily verse (no auth required)
curl http://localhost:3000/api/v1/daily

# Chat with the Bible (requires API key)
curl -X POST http://localhost:3000/api/v1/chat \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"message": "What does the Bible say about love?"}'
```

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api/v1
```

### Authentication
```javascript
headers: {
  'Authorization': 'Bearer YOUR_API_KEY',
  'Content-Type': 'application/json'
}
```

### Main Endpoints

#### 💬 Chat with the Bible
```http
POST /chat
```
```json
{
  "message": "How can I find peace in difficult times?",
  "mode": "conversational",
  "translation": "KJV",
  "maxVerses": 5
}
```

**Response:**
```json
{
  "response": "The Bible offers profound wisdom about finding peace...",
  "verses": [
    {
      "reference": "Philippians 4:7",
      "text": "And the peace of God, which passeth all understanding...",
      "book": "Philippians",
      "chapter": 4,
      "verse": 7
    }
  ],
  "metadata": {
    "confidence": 0.95,
    "tokensUsed": 250
  }
}
```

#### 🔍 Search Verses
```http
GET /verses/search?query=faith&limit=10&translation=KJV
```

#### 📖 Explain Verse
```http
POST /verses/explain
```
```json
{
  "book": "John",
  "chapter": 3,
  "verse": 16,
  "depth": "moderate"
}
```

#### 🌅 Daily Verse
```http
GET /daily
```

#### 🙏 Biblical Counseling
```http
POST /counsel
```
```json
{
  "topic": "anxiety",
  "situation": "Worried about the future"
}
```

### Response Modes

- `conversational` - Natural, friendly dialogue
- `study` - Detailed theological analysis
- `devotional` - Inspirational and meditative
- `counseling` - Pastoral guidance approach

## 🎨 UI Interface

The project includes a beautiful Svelte-based UI with the **Illuminated Sanctuary** theme:

```bash
# Start the UI development server
cd biblechat-ui
npm install
npm run dev
```

UI available at `http://localhost:5688`

### UI Features:
- **Divine Conversation**: Chat interface with AI
- **Scripture Search**: Advanced verse search
- **Daily Blessing**: Daily verse with reflection
- Cathedral-inspired design with gold, purple, and blue gradients
- Responsive design for all devices

## 🏗️ Architecture

```
BibleChat API
├── 🧠 AI Layer (GPT-4 + RAG)
│   ├── Context Enhancement
│   ├── Verse Retrieval
│   └── Response Generation
├── ✅ Validation Layer
│   ├── Theological Verification
│   └── Verse Authentication
├── 📚 Database Layer
│   ├── 31,100+ Bible Verses
│   ├── Topics & Themes
│   └── User Sessions
└── 🔒 Security Layer
    ├── JWT Authentication
    ├── Rate Limiting
    └── API Key Management
```

## 🛠️ Technology Stack

- **Backend**: Node.js, TypeScript, Express.js
- **Database**: PostgreSQL (Supabase compatible)
- **AI**: OpenAI GPT-4, RAG pattern
- **Caching**: Redis (optional)
- **Frontend**: Svelte, TypeScript, Vite
- **Authentication**: JWT, bcrypt
- **Testing**: Jest, Supertest
- **Documentation**: OpenAPI/Swagger

## 🚀 Deployment

### Deploy to Railway (Recommended)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Deploy
railway login
railway link
railway up
```

### Deploy to Vercel

```bash
# Frontend
cd biblechat-ui
vercel --prod
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## 🔧 Configuration

### Environment Variables

```env
# Database
DATABASE_URL=postgresql://...

# OpenAI
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4

# Security
JWT_SECRET=your-secret-key
CORS_ORIGIN=http://localhost:5688

# Redis (optional)
REDIS_URL=redis://localhost:6379
```

### Database Setup

```sql
-- Automatic migrations included
npm run db:migrate
npm run db:seed
```

## 📊 API Limits

| Tier | Rate Limit | Cost |
|------|------------|------|
| Free | 1,000 req/hour | $0 |
| Pro | 10,000 req/hour | $29/mo |
| Enterprise | Unlimited | Custom |

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific tests
npm test -- --grep "chat"
```

## 📖 Examples

### JavaScript/TypeScript
```javascript
import { BibleChatAPI } from './biblechat-client';

const bible = new BibleChatAPI('your-api-key');

// Chat with the Bible
const response = await bible.chat("What does the Bible say about hope?");
console.log(response.verses);

// Search verses
const verses = await bible.search("love", { limit: 5 });

// Get daily verse
const daily = await bible.getDailyVerse();
```

### Python
```python
import requests

api_key = "your-api-key"
headers = {"Authorization": f"Bearer {api_key}"}

response = requests.post(
    "http://localhost:3000/api/v1/chat",
    headers=headers,
    json={"message": "What is faith?"}
)

print(response.json()["response"])
```

### cURL
```bash
curl -X POST http://localhost:3000/api/v1/chat \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"message": "How can I find wisdom?"}'
```

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

- Bible text from public domain translations
- OpenAI for GPT-4 API
- Supabase for database hosting
- All contributors and users

## 💬 Support

- **Documentation**: [API Docs](http://localhost:3000/api-docs)
- **Issues**: [GitHub Issues](https://github.com/yourusername/biblechat-api/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/biblechat-api/discussions)

## 🔮 Roadmap

- [ ] Mobile SDK (iOS/Android)
- [ ] Voice integration
- [ ] Multi-language support
- [ ] Bible study plans API
- [ ] Webhook support
- [ ] GraphQL endpoint
- [ ] Bible maps integration
- [ ] Original language (Greek/Hebrew) support

## ⭐ Star History

[![Star History Chart](https://api.star-history.com/svg?repos=yourusername/biblechat-api&type=Date)](https://star-history.com/#yourusername/biblechat-api&Date)

---

<div align="center">
  
**Built with ❤️ and 🙏**

[Website](https://biblechat.app) • [API Docs](https://docs.biblechat.app) • [Twitter](https://twitter.com/biblechatapi)

</div>