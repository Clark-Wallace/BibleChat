import { query } from './database';

export interface Topic {
  id?: number;
  topic: string;
  category?: string;
  related_topics?: string[];
  created_at?: Date;
}

export interface TopicVerse {
  topic_id: number;
  verse_id: number;
  relevance_score: number;
}

export class TopicModel {
  static async create(topic: Omit<Topic, 'id' | 'created_at'>): Promise<Topic> {
    const text = `
      INSERT INTO topics (topic, category, related_topics)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const values = [topic.topic, topic.category, topic.related_topics];
    const result = await query(text, values);
    return result.rows[0];
  }

  static async findByName(topicName: string): Promise<Topic | null> {
    const text = `SELECT * FROM topics WHERE topic = $1`;
    const result = await query(text, [topicName]);
    return result.rows[0] || null;
  }

  static async findById(id: number): Promise<Topic | null> {
    const text = `SELECT * FROM topics WHERE id = $1`;
    const result = await query(text, [id]);
    return result.rows[0] || null;
  }

  static async findByCategory(category: string): Promise<Topic[]> {
    const text = `SELECT * FROM topics WHERE category = $1 ORDER BY topic`;
    const result = await query(text, [category]);
    return result.rows;
  }

  static async search(searchQuery: string, limit: number = 10): Promise<Topic[]> {
    const text = `
      SELECT * FROM topics
      WHERE topic ILIKE $1 OR category ILIKE $1
      ORDER BY 
        CASE 
          WHEN topic ILIKE $2 THEN 0
          ELSE 1
        END,
        topic
      LIMIT $3
    `;
    const searchPattern = `%${searchQuery}%`;
    const exactMatch = searchQuery;
    const result = await query(text, [searchPattern, exactMatch, limit]);
    return result.rows;
  }

  static async getAll(limit: number = 100): Promise<Topic[]> {
    const text = `SELECT * FROM topics ORDER BY topic LIMIT $1`;
    const result = await query(text, [limit]);
    return result.rows;
  }

  static async addVerseToTopic(
    topicId: number,
    verseId: number,
    relevanceScore: number = 0.5
  ): Promise<boolean> {
    const text = `
      INSERT INTO topic_verses (topic_id, verse_id, relevance_score)
      VALUES ($1, $2, $3)
      ON CONFLICT (topic_id, verse_id) 
      DO UPDATE SET relevance_score = $3
      RETURNING *
    `;
    const result = await query(text, [topicId, verseId, relevanceScore]);
    return (result.rowCount ?? 0) > 0;
  }

  static async getRelatedTopics(topicId: number): Promise<string[]> {
    const text = `SELECT related_topics FROM topics WHERE id = $1`;
    const result = await query(text, [topicId]);
    return result.rows[0]?.related_topics || [];
  }

  static async createBulk(topics: Omit<Topic, 'id' | 'created_at'>[]): Promise<number> {
    const values: any[] = [];
    const placeholders: string[] = [];
    
    topics.forEach((topic, index) => {
      const base = index * 3;
      placeholders.push(`($${base + 1}, $${base + 2}, $${base + 3})`);
      values.push(topic.topic, topic.category, topic.related_topics);
    });

    const text = `
      INSERT INTO topics (topic, category, related_topics)
      VALUES ${placeholders.join(', ')}
      ON CONFLICT (topic) DO NOTHING
    `;
    
    const result = await query(text, values);
    return result.rowCount ?? 0;
  }
}