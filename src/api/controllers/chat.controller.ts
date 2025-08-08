import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { ChatGPTService } from '../../services/ai/chatGPT.service';
import { RAGService } from '../../services/ai/rag.service';
import { ValidationService } from '../../services/ai/validation.service';
import { ApiKeyModel } from '../../models/database/apiKey.model';
import { chatRequestSchema } from '../../utils/validator';
import logger from '../../utils/logger';
import { v4 as uuidv4 } from 'uuid';
import { ApiError } from '../middleware/error.middleware';
import { query } from '../../models/database/database';

export class ChatController {
  private chatGPTService: ChatGPTService;
  private ragService: RAGService;
  private validationService: ValidationService;

  constructor() {
    this.chatGPTService = new ChatGPTService();
    this.ragService = new RAGService();
    this.validationService = new ValidationService();
  }

  async chat(req: AuthenticatedRequest, res: Response): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Validate request
      const { error, value } = chatRequestSchema.validate(req.body);
      if (error) {
        throw new ApiError(400, error.details[0].message);
      }

      const {
        message,
        context,
        conversationId,
        mode,
        translation,
        includeCommentary,
        maxVerses,
      } = value;

      // Generate or use existing conversation ID
      const convId = conversationId || uuidv4();

      // Enhance query with biblical context
      const { enhancedQuery, topics } = await this.ragService.enhanceQueryWithContext(message);

      // Retrieve relevant verses using RAG
      const relevantVerses = await this.ragService.retrieveRelevantVerses(
        enhancedQuery,
        maxVerses,
        translation
      );

      logger.info(`Found ${relevantVerses.length} relevant verses for query`);

      // Generate AI response
      const aiResponse = await this.chatGPTService.generateResponse(
        message,
        context,
        relevantVerses,
        mode
      );

      // Validate the response
      const validation = await this.validationService.validateResponse(
        aiResponse,
        message
      );

      if (!validation.isValid) {
        logger.warn('Response validation had issues:', validation.issues);
        // Continue anyway but log the issues
        // throw new ApiError(500, 'Unable to generate valid response');
      }

      // Apply any necessary corrections
      let finalResponse = aiResponse.response;
      if (validation.corrections.length > 0) {
        finalResponse += '\n\n' + validation.corrections.join('\n');
      }

      // Track API usage
      if (req.apiKeyId) {
        await ApiKeyModel.incrementUsage(req.apiKeyId, 1);
        await this.trackUsage(
          req.apiKeyId,
          '/api/v1/chat',
          aiResponse.tokensUsed,
          Date.now() - startTime,
          200
        );
      }

      // Store conversation if needed
      if (includeCommentary) {
        await this.storeConversation(convId, req.apiKey?.key || '', message, finalResponse);
      }

      // Prepare response
      const response = {
        response: finalResponse,
        verses: relevantVerses,
        followUpQuestions: aiResponse.followUpQuestions || [],
        relatedTopics: [...new Set([...topics, ...(aiResponse.relatedTopics || [])])],
        conversationId: convId,
        metadata: {
          confidence: aiResponse.confidence,
          tokensUsed: aiResponse.tokensUsed,
          responseTime: Date.now() - startTime,
        },
      };

      res.json(response);
    } catch (error: any) {
      logger.error('Chat endpoint error:', error);
      
      // Track failed request
      if (req.apiKeyId) {
        await this.trackUsage(
          req.apiKeyId,
          '/api/v1/chat',
          0,
          Date.now() - startTime,
          error.statusCode || 500
        );
      }

      if (error instanceof ApiError) {
        res.status(error.statusCode).json({
          error: error.message,
          statusCode: error.statusCode,
        });
      } else {
        res.status(500).json({
          error: 'Failed to process chat request',
          message: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
      }
    }
  }

  async getChatHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { conversationId } = req.params;
      
      if (!conversationId) {
        throw new ApiError(400, 'Conversation ID required');
      }

      // Get conversation from database
      const result = await query(
        'SELECT * FROM conversations WHERE id = $1 AND api_key = $2',
        [conversationId, req.apiKey?.key || '']
      );

      if (result.rows.length === 0) {
        throw new ApiError(404, 'Conversation not found');
      }

      const conversation = result.rows[0];
      res.json({
        conversationId: conversation.id,
        messages: conversation.messages,
        createdAt: conversation.created_at,
        updatedAt: conversation.updated_at,
      });
    } catch (error: any) {
      logger.error('Get chat history error:', error);
      
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({
          error: error.message,
          statusCode: error.statusCode,
        });
      } else {
        res.status(500).json({
          error: 'Failed to retrieve chat history',
        });
      }
    }
  }

  private async trackUsage(
    apiKeyId: number,
    endpoint: string,
    tokensUsed: number,
    responseTime: number,
    statusCode: number
  ): Promise<void> {
    try {
      await query(
        `INSERT INTO api_usage (api_key, endpoint, tokens_used, response_time_ms, status_code)
         VALUES ((SELECT key FROM api_keys WHERE id = $1), $2, $3, $4, $5)`,
        [apiKeyId, endpoint, tokensUsed, responseTime, statusCode]
      );
    } catch (error) {
      logger.error('Failed to track API usage:', error);
    }
  }

  private async storeConversation(
    conversationId: string,
    apiKey: string,
    userMessage: string,
    assistantResponse: string
  ): Promise<void> {
    try {
      const messages = [
        { role: 'user', content: userMessage, timestamp: new Date() },
        { role: 'assistant', content: assistantResponse, timestamp: new Date() },
      ];

      await query(
        `INSERT INTO conversations (id, api_key, messages)
         VALUES ($1, $2, $3)
         ON CONFLICT (id) DO UPDATE
         SET messages = conversations.messages || $3,
             updated_at = NOW()`,
        [conversationId, apiKey, JSON.stringify(messages)]
      );
    } catch (error) {
      logger.error('Failed to store conversation:', error);
    }
  }
}