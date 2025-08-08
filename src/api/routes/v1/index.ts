import { Router, Request, Response } from 'express';
import { ChatController } from '../../controllers/chat.controller';
import { VerseController } from '../../controllers/verse.controller';
import { authenticateAPIKey, requireTier, AuthenticatedRequest } from '../../middleware/auth.middleware';
import { asyncHandler } from '../../middleware/error.middleware';

const router = Router();

// Initialize controllers
const chatController = new ChatController();
const verseController = new VerseController();

// Rate limiter configuration

// Chat endpoints
router.post(
  '/chat',
  authenticateAPIKey,
  asyncHandler((req, res) => chatController.chat(req as AuthenticatedRequest, res))
);

router.get(
  '/chat/:conversationId',
  authenticateAPIKey,
  asyncHandler((req, res) => chatController.getChatHistory(req as AuthenticatedRequest, res))
);

// Verse endpoints
router.post(
  '/verses/explain',
  authenticateAPIKey,
  asyncHandler((req, res) => verseController.explainVerse(req as AuthenticatedRequest, res))
);

router.get(
  '/verses/search',
  authenticateAPIKey,
  asyncHandler((req, res) => verseController.searchVerses(req as AuthenticatedRequest, res))
);

router.get(
  '/verses/:reference',
  authenticateAPIKey,
  asyncHandler((req, res) => verseController.getVerse(req as AuthenticatedRequest, res))
);

router.get(
  '/verses/range/:reference',
  authenticateAPIKey,
  asyncHandler((req, res) => verseController.getVerseRange(req as AuthenticatedRequest, res))
);

// Daily verse endpoint
router.get(
  '/daily',
  asyncHandler(async (req: Request, res: Response) => {
    const verseService = new (await import('../../../services/bible/verse.service')).VerseService();
    const chatGPTService = new (await import('../../../services/ai/chatGPT.service')).ChatGPTService();
    
    const { translation = 'NIV', mood, situation } = req.query;
    
    // Get random verse or verse based on mood/situation
    let verse;
    if (mood || situation) {
      const query = `${mood || ''} ${situation || ''}`.trim();
      const verses = await verseService.searchVerses(query, 1, translation as string);
      verse = verses[0];
    } else {
      verse = await verseService.getRandomVerse(translation as string);
    }
    
    if (!verse) {
      res.status(404).json({ error: 'No verse found' });
      return;
    }
    
    // Generate reflection and prayer
    const reflection = await chatGPTService.generateResponse(
      `Provide a brief reflection on ${verse.book} ${verse.chapter}:${verse.verse}`,
      situation as string || '',
      [{ ...verse, reference: `${verse.book} ${verse.chapter}:${verse.verse}`, relevance: 1 }],
      'devotional'
    );
    
    const prayer = await chatGPTService.generatePrayer(
      mood as string || 'daily guidance',
      situation as string
    );
    
    res.json({
      verse: {
        ...verse,
        reference: `${verse.book} ${verse.chapter}:${verse.verse}`,
      },
      reflection: reflection.response,
      prayer,
      application: `Consider how this verse applies to your life today.`,
    });
  })
);

// Topics endpoint
router.get(
  '/topics/:topic',
  authenticateAPIKey,
  asyncHandler(async (req: Request, res: Response) => {
    const { topic } = req.params;
    const { depth = 'basic', limit = 10, translation = 'NIV' } = req.query;
    
    const verseService = new (await import('../../../services/bible/verse.service')).VerseService();
    const chatGPTService = new (await import('../../../services/ai/chatGPT.service')).ChatGPTService();
    const { TopicModel } = await import('../../../models/database/topic.model');
    
    // Get topic information
    const topicData = await TopicModel.findByName(topic);
    if (!topicData) {
      res.status(404).json({ error: 'Topic not found' });
      return;
    }
    
    // Get verses for topic
    const verses = await verseService.getVersesByTopic(
      topic,
      parseInt(limit as string, 10),
      translation as string
    );
    
    // Generate overview
    const overview = await chatGPTService.generateResponse(
      `Provide a ${depth} overview of the biblical topic of ${topic}`,
      '',
      verses,
      'study'
    );
    
    res.json({
      topic,
      overview: overview.response,
      keyVerses: verses,
      subtopics: topicData.related_topics || [],
      practicalSteps: [
        `Study the key verses about ${topic}`,
        `Reflect on how ${topic} applies to your life`,
        `Practice ${topic} in your daily walk`,
      ],
      commonQuestions: overview.followUpQuestions?.map(q => ({
        question: q,
        answer: 'Explore this question through prayer and study',
      })) || [],
    });
  })
);

// Counsel endpoint
router.post(
  '/counsel',
  authenticateAPIKey,
  requireTier('paid'),
  asyncHandler(async (req: Request, res: Response) => {
    const { situation, category, specificIssues = [], denomination } = req.body;
    
    if (!situation) {
      res.status(400).json({ error: 'Situation is required' });
      return;
    }
    
    const ragService = new (await import('../../../services/ai/rag.service')).RAGService();
    const chatGPTService = new (await import('../../../services/ai/chatGPT.service')).ChatGPTService();
    
    // Build query from situation and issues
    const query = `${situation} ${specificIssues.join(' ')}`.trim();
    
    // Get relevant verses
    const verses = await ragService.retrieveRelevantVerses(query, 7);
    
    // Generate counseling response
    const counselPrompt = `Provide biblical counseling for someone in this situation: ${situation}. 
      ${category ? `Category: ${category}.` : ''} 
      ${specificIssues.length > 0 ? `Specific issues: ${specificIssues.join(', ')}.` : ''}
      ${denomination ? `From a ${denomination} perspective.` : 'From a non-denominational Christian perspective.'}`;
    
    const guidance = await chatGPTService.generateResponse(
      counselPrompt,
      '',
      verses,
      'conversational'
    );
    
    // Generate prayer
    const prayer = await chatGPTService.generatePrayer(category || 'guidance', situation);
    
    res.json({
      guidance: guidance.response,
      relevantVerses: verses,
      practicalSteps: [
        'Pray about this situation daily',
        'Study the provided verses in context',
        'Seek wisdom from trusted spiritual advisors',
        'Take one small step of faith today',
        'Trust God\'s timing and plan',
      ],
      prayerSuggestion: prayer,
      disclaimer: 'This is biblical guidance for spiritual growth. For serious personal issues, please consult with a pastor, licensed counselor, or appropriate professional.',
      resources: [
        {
          title: 'Local Church',
          type: 'Community',
          description: 'Connect with a local church for in-person support',
        },
        {
          title: 'Christian Counselor',
          type: 'Professional',
          description: 'Consider speaking with a Christian counselor',
        },
        {
          title: 'Bible Study Group',
          type: 'Community',
          description: 'Join a Bible study group for ongoing support',
        },
      ],
    });
  })
);

// API key management endpoints (for premium users)
router.get(
  '/account/usage',
  authenticateAPIKey,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { ApiKeyModel } = await import('../../../models/database/apiKey.model');
    
    if (!req.apiKeyId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    
    const usage = await ApiKeyModel.getUsageStats(req.apiKeyId);
    
    if (!usage) {
      res.status(404).json({ error: 'Usage data not found' });
      return;
    }
    
    const resetDate = new Date();
    resetDate.setMonth(resetDate.getMonth() + 1);
    resetDate.setDate(1);
    resetDate.setHours(0, 0, 0, 0);
    
    res.json({
      apiKey: req.apiKey?.name || 'Unknown',
      tier: usage.tier,
      monthlyLimit: usage.monthlyLimit,
      currentUsage: usage.currentUsage,
      remainingCalls: usage.remainingCalls,
      percentUsed: usage.percentUsed,
      resetDate,
    });
  })
);

// Swagger documentation endpoint
router.get('/swagger.json', (_req: Request, res: Response) => {
  res.json({
    openapi: '3.0.0',
    info: {
      title: 'BibleChat API',
      version: '1.0.0',
      description: 'AI-powered Biblical conversation API',
    },
    servers: [
      {
        url: process.env.API_URL || `http://localhost:${process.env.PORT || 3000}/api/v1`,
      },
    ],
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'Authorization',
          description: 'Use format: Bearer YOUR_API_KEY',
        },
      },
    },
    security: [
      {
        ApiKeyAuth: [],
      },
    ],
    paths: {
      '/chat': {
        post: {
          summary: 'Chat with the Bible',
          description: 'Get AI-powered biblical responses to questions',
          tags: ['Chat'],
        },
      },
      '/verses/explain': {
        post: {
          summary: 'Explain a Bible verse',
          description: 'Get detailed explanation of a specific verse',
          tags: ['Verses'],
        },
      },
      '/daily': {
        get: {
          summary: 'Get daily verse',
          description: 'Get a daily Bible verse with reflection',
          tags: ['Daily'],
        },
      },
    },
  });
});

export default router;