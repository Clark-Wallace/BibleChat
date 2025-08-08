import { query } from '../../models/database/database';
import logger from '../../utils/logger';
import dotenv from 'dotenv';

dotenv.config();

const createTables = async () => {
  try {
    // Enable extensions
    await query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await query(`CREATE EXTENSION IF NOT EXISTS "pg_trgm"`);
    
    // Create verses table
    await query(`
      CREATE TABLE IF NOT EXISTS verses (
        id SERIAL PRIMARY KEY,
        book VARCHAR(50) NOT NULL,
        chapter INTEGER NOT NULL,
        verse INTEGER NOT NULL,
        text TEXT NOT NULL,
        translation VARCHAR(10) DEFAULT 'NIV',
        testament VARCHAR(3) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE (book, chapter, verse, translation)
      )
    `);
    
    // Create indexes for verses
    await query(`CREATE INDEX IF NOT EXISTS idx_book_chapter_verse ON verses(book, chapter, verse)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_verse_text_trgm ON verses USING gin(text gin_trgm_ops)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_verse_translation ON verses(translation)`);
    
    // Create topics table
    await query(`
      CREATE TABLE IF NOT EXISTS topics (
        id SERIAL PRIMARY KEY,
        topic VARCHAR(100) NOT NULL UNIQUE,
        category VARCHAR(50),
        related_topics TEXT[],
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    // Create topic_verses relationship table
    await query(`
      CREATE TABLE IF NOT EXISTS topic_verses (
        topic_id INTEGER REFERENCES topics(id) ON DELETE CASCADE,
        verse_id INTEGER REFERENCES verses(id) ON DELETE CASCADE,
        relevance_score DECIMAL(3,2) DEFAULT 0.50,
        PRIMARY KEY (topic_id, verse_id)
      )
    `);
    
    // Create cross_references table
    await query(`
      CREATE TABLE IF NOT EXISTS cross_references (
        verse_id INTEGER REFERENCES verses(id) ON DELETE CASCADE,
        referenced_verse_id INTEGER REFERENCES verses(id) ON DELETE CASCADE,
        reference_type VARCHAR(20),
        PRIMARY KEY (verse_id, referenced_verse_id)
      )
    `);
    
    // Create api_keys table
    await query(`
      CREATE TABLE IF NOT EXISTS api_keys (
        id SERIAL PRIMARY KEY,
        key VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(100),
        tier VARCHAR(20) DEFAULT 'free',
        monthly_limit INTEGER DEFAULT 1000,
        current_usage INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        expires_at TIMESTAMP,
        is_active BOOLEAN DEFAULT true
      )
    `);
    
    // Create api_usage table
    await query(`
      CREATE TABLE IF NOT EXISTS api_usage (
        id SERIAL PRIMARY KEY,
        api_key VARCHAR(255) NOT NULL,
        endpoint VARCHAR(100),
        tokens_used INTEGER,
        response_time_ms INTEGER,
        status_code INTEGER,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    // Create index for api_usage
    await query(`CREATE INDEX IF NOT EXISTS idx_api_key_date ON api_usage(api_key, created_at)`);
    
    // Create conversations table
    await query(`
      CREATE TABLE IF NOT EXISTS conversations (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        api_key VARCHAR(255),
        messages JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    // Create function to update updated_at timestamp
    await query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);
    
    // Create trigger for conversations
    await query(`
      DROP TRIGGER IF EXISTS update_conversations_updated_at ON conversations;
      CREATE TRIGGER update_conversations_updated_at 
      BEFORE UPDATE ON conversations 
      FOR EACH ROW 
      EXECUTE FUNCTION update_updated_at_column();
    `);
    
    logger.info('All database tables created successfully');
  } catch (error) {
    logger.error('Error creating database tables:', error);
    throw error;
  }
};

const seedInitialData = async () => {
  try {
    // Check if we have any API keys
    const apiKeyCheck = await query('SELECT COUNT(*) FROM api_keys');
    if (apiKeyCheck.rows[0].count === '0') {
      // Create a default development API key
      const devKey = 'dev_key_' + Math.random().toString(36).substring(2, 15);
      await query(`
        INSERT INTO api_keys (key, name, tier, monthly_limit)
        VALUES ($1, 'Development Key', 'premium', 100000)
      `, [devKey]);
      logger.info(`Created development API key: ${devKey}`);
    }
    
    // Seed initial topics
    const topicCheck = await query('SELECT COUNT(*) FROM topics');
    if (topicCheck.rows[0].count === '0') {
      const topics = [
        { topic: 'Love', category: 'Character', related: ['Compassion', 'Kindness'] },
        { topic: 'Faith', category: 'Spiritual Life', related: ['Trust', 'Belief'] },
        { topic: 'Hope', category: 'Spiritual Life', related: ['Perseverance', 'Future'] },
        { topic: 'Prayer', category: 'Spiritual Practices', related: ['Worship', 'Meditation'] },
        { topic: 'Forgiveness', category: 'Relationships', related: ['Mercy', 'Grace'] },
        { topic: 'Wisdom', category: 'Character', related: ['Knowledge', 'Understanding'] },
        { topic: 'Peace', category: 'Spiritual Life', related: ['Rest', 'Comfort'] },
        { topic: 'Joy', category: 'Emotions', related: ['Happiness', 'Celebration'] },
        { topic: 'Patience', category: 'Character', related: ['Endurance', 'Waiting'] },
        { topic: 'Healing', category: 'Health', related: ['Restoration', 'Wholeness'] },
      ];
      
      for (const topic of topics) {
        await query(`
          INSERT INTO topics (topic, category, related_topics)
          VALUES ($1, $2, $3)
          ON CONFLICT (topic) DO NOTHING
        `, [topic.topic, topic.category, topic.related]);
      }
      logger.info('Seeded initial topics');
    }
    
    logger.info('Initial data seeding completed');
  } catch (error) {
    logger.error('Error seeding initial data:', error);
    throw error;
  }
};

const migrate = async () => {
  logger.info('Starting database migration...');
  
  try {
    await createTables();
    await seedInitialData();
    logger.info('Database migration completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Database migration failed:', error);
    process.exit(1);
  }
};

// Run migration if this file is executed directly
if (require.main === module) {
  migrate();
}

export { migrate, createTables, seedInitialData };