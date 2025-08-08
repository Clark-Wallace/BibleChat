# BibleChat Standalone Module

A lightweight, standalone JavaScript/TypeScript module for integrating Bible chat functionality into any application without requiring a separate API server.

## 📦 Installation

```bash
npm install @biblechat/core
# or
yarn add @biblechat/core
```

## 🚀 Quick Start

### Basic Usage (No AI - Offline)
```javascript
import BibleChat from '@biblechat/core';

// Initialize without OpenAI for offline verse search
const bible = new BibleChat();

// Search for verses
const results = await bible.searchVerses('love');
console.log(results.results); // Array of verses about love

// Get a specific verse
const verse = await bible.getVerse('John', 3, 16);
console.log(verse.text);

// Get daily verse
const daily = await bible.getDailyVerse();
console.log(daily.verse.reference, daily.reflection);
```

### With AI Features
```javascript
import BibleChat from '@biblechat/core';

// Initialize with OpenAI API key for full features
const bible = new BibleChat({
  openAIKey: 'sk-your-openai-api-key',
  defaultTranslation: 'KJV'
});

// Chat with the Bible using AI
const response = await bible.chat('What does the Bible say about forgiveness?');
console.log(response.response); // AI-generated response
console.log(response.verses);   // Supporting verses

// Get AI-powered verse explanation
const verse = await bible.getVerse('Romans', 8, 28);
const explanation = await bible.explainVerse(verse, 'simple');
console.log(explanation);
```

## 🎯 Features

### Core Features (No API Key Required)
- ✅ **Full Bible Database** - 31,100+ verses embedded
- ✅ **Verse Search** - Fast local search
- ✅ **Verse Lookup** - Get specific verses
- ✅ **Daily Verse** - Random verse with reflection
- ✅ **Topic Search** - Find verses by topic
- ✅ **Offline Support** - Works without internet

### AI Features (OpenAI Key Required)
- 🤖 **Natural Chat** - Conversational Bible Q&A
- 📖 **Verse Explanation** - AI-powered explanations
- 🎓 **Study Mode** - Deep theological insights
- 🙏 **Counseling Mode** - Pastoral guidance
- ✨ **Context-Aware** - RAG-powered accuracy

## 📋 API Reference

### Constructor
```typescript
const bible = new BibleChat(config?: {
  openAIKey?: string;        // OpenAI API key for AI features
  defaultTranslation?: string; // Default Bible translation
  customBibleData?: Verse[];  // Custom Bible dataset
  offlineMode?: boolean;      // Force offline mode
});
```

### Methods

#### `chat(message: string, options?): Promise<ChatResponse>`
Chat with the Bible using AI (requires OpenAI key).

#### `searchVerses(query: string, options?): Promise<SearchResults>`
Search for verses containing keywords.

#### `getVerse(book: string, chapter: number, verse: number): Promise<Verse>`
Get a specific Bible verse.

#### `getDailyVerse(): Promise<DailyVerse>`
Get a random daily verse with reflection.

#### `getVersesByTopic(topic: string, limit?: number): Promise<Verse[]>`
Get verses related to a specific topic.

#### `explainVerse(verse: Verse, depth?: 'simple' | 'moderate' | 'deep'): Promise<string>`
Get explanation of a verse (AI-powered if available).

#### `hasAI(): boolean`
Check if AI features are available.

#### `getBooks(): string[]`
Get list of all Bible books.

#### `getChapters(book: string): number[]`
Get list of chapters in a book.

## 💾 Size & Performance

| Configuration | Size | Load Time | Features |
|--------------|------|-----------|----------|
| Core Only | ~15 KB | <50ms | Search, lookup, offline |
| With Bible Data | ~2.3 MB | <200ms | Full offline Bible |
| With AI | ~2.5 MB | <300ms | All features |

## 🔧 Integration Examples

### React/Next.js
```jsx
import { useState } from 'react';
import BibleChat from '@biblechat/core';

const bible = new BibleChat({ 
  openAIKey: process.env.NEXT_PUBLIC_OPENAI_KEY 
});

function BibleChatComponent() {
  const [response, setResponse] = useState('');
  
  const handleChat = async (message) => {
    const result = await bible.chat(message);
    setResponse(result.response);
  };
  
  return (
    <div>
      <input onSubmit={(e) => handleChat(e.target.value)} />
      <div>{response}</div>
    </div>
  );
}
```

### Vue.js
```vue
<template>
  <div>
    <input v-model="question" @submit="askBible" />
    <div>{{ answer }}</div>
  </div>
</template>

<script>
import BibleChat from '@biblechat/core';

export default {
  data() {
    return {
      bible: new BibleChat(),
      question: '',
      answer: ''
    };
  },
  methods: {
    async askBible() {
      const result = await this.bible.searchVerses(this.question);
      this.answer = result.results[0]?.text || 'No verses found';
    }
  }
};
</script>
```

### Vanilla JavaScript
```html
<!DOCTYPE html>
<html>
<head>
  <script src="https://unpkg.com/@biblechat/core"></script>
</head>
<body>
  <input id="search" placeholder="Search the Bible..." />
  <div id="results"></div>
  
  <script>
    const bible = new BibleChat();
    
    document.getElementById('search').addEventListener('change', async (e) => {
      const results = await bible.searchVerses(e.target.value);
      document.getElementById('results').innerHTML = 
        results.results.map(v => `<p>${v.reference}: ${v.text}</p>`).join('');
    });
  </script>
</body>
</html>
```

## 🌐 Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Node.js 16+

## 📊 Comparison with API Version

| Feature | Standalone Module | API Version |
|---------|------------------|-------------|
| Installation | NPM install | Server setup |
| Bible Data | Embedded (2.3MB) | Database (PostgreSQL) |
| AI Chat | Direct OpenAI | Server-processed |
| Offline Mode | ✅ Full support | ❌ Requires server |
| Rate Limiting | Client-side | Server-side |
| Cost | OpenAI only | Server + OpenAI |
| Scalability | Per-client | Centralized |
| Security | API key in client* | API key on server |

*Note: For production, use environment variables or proxy server for API keys

## 🔒 Security Considerations

1. **API Keys**: Never expose OpenAI keys in client-side code for production
2. **Proxy Server**: Use a simple proxy for API key management:

```javascript
// Simple Express proxy for API keys
app.post('/api/chat', async (req, res) => {
  const bible = new BibleChat({ 
    openAIKey: process.env.OPENAI_KEY 
  });
  const result = await bible.chat(req.body.message);
  res.json(result);
});
```

## 📈 Bundle Size Optimization

### Tree Shaking
```javascript
// Import only what you need
import { VerseSearch, BibleDatabase } from '@biblechat/core';

const search = new VerseSearch();
const results = await search.search('love');
```

### Dynamic Import for AI
```javascript
// Load AI features only when needed
async function enableAI() {
  const { AIChat } = await import('@biblechat/core/ai');
  return new AIChat(apiKey);
}
```

## 🚀 Performance Tips

1. **Cache Results**: Module includes built-in caching
2. **Lazy Load**: Load Bible data on demand
3. **Web Workers**: Run searches in background
4. **IndexedDB**: Store Bible data locally

## 📄 License

MIT - Free for commercial and personal use

## 🤝 Support

- GitHub Issues: [github.com/yourusername/biblechat](https://github.com/yourusername/biblechat)
- Documentation: [biblechat.app/docs](https://biblechat.app/docs)

---

Made with ❤️ and 🙏 for the spiritual developer community