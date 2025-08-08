import OpenAI from 'openai';
import { Verse, VerseWithRelevance } from '../../models/types/response.types';
import logger from '../../utils/logger';
import redisService from '../cache/redis.service';
import { CACHE_TTL } from '../../utils/constants';

export interface AIResponse {
  response: string;
  confidence: number;
  tokensUsed: number;
  followUpQuestions?: string[];
  relatedTopics?: string[];
}

export class ChatGPTService {
  private openai: OpenAI | null = null;
  private systemPrompt: string;

  constructor() {
    this.systemPrompt = `You are a biblical counselor AI that provides scripturally accurate responses based on Christian theology.

CRITICAL RULES:
1. ONLY cite actual Bible verses that exist - NEVER fabricate or invent verses
2. Always provide accurate verse references in the format "Book Chapter:Verse"
3. Remain non-denominational Christian unless a specific denomination is requested
4. Be compassionate, understanding, and encouraging
5. Include practical application of biblical principles
6. Never claim to be God or speak for God directly
7. Suggest pastoral counseling for serious personal issues
8. If unsure about a verse reference, say so - never guess or make up verses
9. When verses are provided as context, use them in your response

Your responses should:
- Be grounded in biblical truth
- Show empathy and understanding
- Provide hope and encouragement
- Offer practical guidance
- Be appropriate for all ages`;
  }

  private getOpenAI(): OpenAI {
    if (!this.openai) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }
    return this.openai;
  }

  async generateResponse(
    question: string,
    context: string = '',
    relevantVerses: VerseWithRelevance[] = [],
    mode: 'conversational' | 'study' | 'devotional' | 'simple' = 'conversational'
  ): Promise<AIResponse> {
    try {
      // Build context from relevant verses
      const verseContext = this.buildVerseContext(relevantVerses);
      
      // Adjust prompt based on mode
      const modePrompt = this.getModePrompt(mode);
      
      // Build the full prompt
      const userPrompt = this.buildUserPrompt(question, context, verseContext);

      // Check cache
      const cacheKey = `ai:response:${Buffer.from(userPrompt).toString('base64').substring(0, 50)}`;
      const cached = await redisService.getJSON<AIResponse>(cacheKey);
      if (cached) {
        logger.debug('Using cached AI response');
        return cached;
      }

      // Call OpenAI
      const completion = await this.getOpenAI().chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4',
        messages: [
          { role: 'system', content: this.systemPrompt + '\n\n' + modePrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: parseInt(process.env.OPENAI_MAX_TOKENS || '1000'),
        temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.7'),
      });

      const responseText = completion.choices[0]?.message?.content || '';
      const tokensUsed = completion.usage?.total_tokens || 0;

      // Extract follow-up questions and topics
      const { followUpQuestions, relatedTopics } = this.extractMetadata(responseText);

      const response: AIResponse = {
        response: this.cleanResponse(responseText),
        confidence: this.calculateConfidence(responseText, relevantVerses),
        tokensUsed,
        followUpQuestions,
        relatedTopics,
      };

      // Cache the response
      await redisService.setJSON(cacheKey, response, CACHE_TTL.LONG);

      return response;
    } catch (error) {
      logger.error('Error generating AI response:', error);
      throw new Error('Failed to generate AI response');
    }
  }

  async explainVerse(
    verse: Verse,
    depth: 'simple' | 'moderate' | 'scholarly' = 'moderate',
    includeGreek: boolean = false
  ): Promise<string> {
    try {
      const depthPrompt = {
        simple: 'Explain this verse in simple, easy-to-understand language suitable for children or new believers.',
        moderate: 'Provide a balanced explanation with context and practical application.',
        scholarly: 'Provide an in-depth theological analysis including historical context and cross-references.',
      }[depth];

      const greekPrompt = includeGreek 
        ? 'Include relevant Greek or Hebrew word meanings where appropriate.' 
        : '';

      const prompt = `Please explain the following Bible verse:

"${verse.text}" - ${verse.book} ${verse.chapter}:${verse.verse}

${depthPrompt} ${greekPrompt}

Include:
1. What this verse means
2. The context in which it was written
3. How it applies to life today`;

      const completion = await this.getOpenAI().chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4',
        messages: [
          { role: 'system', content: this.systemPrompt },
          { role: 'user', content: prompt }
        ],
        max_tokens: 800,
        temperature: 0.7,
      });

      return completion.choices[0]?.message?.content || '';
    } catch (error) {
      logger.error('Error explaining verse:', error);
      throw new Error('Failed to explain verse');
    }
  }

  async generatePrayer(topic: string, situation?: string): Promise<string> {
    try {
      const prompt = `Generate a biblical prayer about ${topic}${situation ? ` for someone in this situation: ${situation}` : ''}.

The prayer should:
- Be grounded in Scripture
- Be sincere and heartfelt
- Include relevant Bible promises
- Be encouraging and faith-building
- Be appropriate for all denominations`;

      const completion = await this.getOpenAI().chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4',
        messages: [
          { role: 'system', content: this.systemPrompt },
          { role: 'user', content: prompt }
        ],
        max_tokens: 400,
        temperature: 0.8,
      });

      return completion.choices[0]?.message?.content || '';
    } catch (error) {
      logger.error('Error generating prayer:', error);
      throw new Error('Failed to generate prayer');
    }
  }

  private buildVerseContext(verses: VerseWithRelevance[]): string {
    if (verses.length === 0) return '';

    return `Here are relevant Bible verses for context:\n\n${
      verses.map(v => `"${v.text}" - ${v.reference} (${v.translation})`).join('\n\n')
    }\n\nPlease incorporate these verses into your response where appropriate.`;
  }

  private getModePrompt(mode: string): string {
    const prompts = {
      conversational: 'Respond in a warm, conversational tone as if talking to a friend seeking guidance.',
      study: 'Provide an educational response suitable for Bible study, including context and deeper meaning.',
      devotional: 'Craft a devotional response that inspires reflection and spiritual growth.',
      simple: 'Use simple language suitable for children or those new to the Bible.',
    };
    return prompts[mode as keyof typeof prompts] || prompts.conversational;
  }

  private buildUserPrompt(question: string, context: string, verseContext: string): string {
    let prompt = question;
    
    if (context) {
      prompt += `\n\nAdditional context: ${context}`;
    }
    
    if (verseContext) {
      prompt += `\n\n${verseContext}`;
    }

    return prompt;
  }

  private extractMetadata(response: string): {
    followUpQuestions: string[];
    relatedTopics: string[];
  } {
    // Simple extraction - could be enhanced with better parsing
    const followUpQuestions: string[] = [];
    const relatedTopics: string[] = [];

    // Extract questions (sentences ending with ?)
    const questions = response.match(/[^.!?]*\?/g) || [];
    followUpQuestions.push(...questions.slice(0, 3).map(q => q.trim()));

    // Extract common biblical topics mentioned
    const topicKeywords = ['faith', 'love', 'hope', 'prayer', 'forgiveness', 'grace', 'peace', 'wisdom'];
    topicKeywords.forEach(topic => {
      if (response.toLowerCase().includes(topic)) {
        relatedTopics.push(topic.charAt(0).toUpperCase() + topic.slice(1));
      }
    });

    return { 
      followUpQuestions: followUpQuestions.slice(0, 3),
      relatedTopics: [...new Set(relatedTopics)].slice(0, 5),
    };
  }

  private cleanResponse(response: string): string {
    // Remove any potential artifacts or unwanted formatting
    return response
      .replace(/\*\*/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  private calculateConfidence(response: string, verses: VerseWithRelevance[]): number {
    // Calculate confidence based on verse relevance and response quality
    let confidence = 0.7; // Base confidence

    if (verses.length > 0) {
      const avgRelevance = verses.reduce((sum, v) => sum + v.relevance, 0) / verses.length;
      confidence = Math.min(0.95, confidence + (avgRelevance * 0.25));
    }

    // Adjust based on response length and quality indicators
    if (response.length > 200) confidence += 0.05;
    if (response.includes('Bible') || response.includes('Scripture')) confidence += 0.05;

    return Math.min(0.99, confidence);
  }
}