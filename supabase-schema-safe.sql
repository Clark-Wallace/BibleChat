-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create verses table
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
);

-- Create indexes for verses
CREATE INDEX IF NOT EXISTS idx_book_chapter_verse ON verses(book, chapter, verse);
CREATE INDEX IF NOT EXISTS idx_verse_text_trgm ON verses USING gin(text gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_verse_translation ON verses(translation);

-- Create topics table
CREATE TABLE IF NOT EXISTS topics (
    id SERIAL PRIMARY KEY,
    topic VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(50),
    related_topics TEXT[],
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create topic_verses relationship table
CREATE TABLE IF NOT EXISTS topic_verses (
    topic_id INTEGER REFERENCES topics(id) ON DELETE CASCADE,
    verse_id INTEGER REFERENCES verses(id) ON DELETE CASCADE,
    relevance_score DECIMAL(3,2) DEFAULT 0.50,
    PRIMARY KEY (topic_id, verse_id)
);

-- Create cross_references table
CREATE TABLE IF NOT EXISTS cross_references (
    verse_id INTEGER REFERENCES verses(id) ON DELETE CASCADE,
    referenced_verse_id INTEGER REFERENCES verses(id) ON DELETE CASCADE,
    reference_type VARCHAR(20),
    PRIMARY KEY (verse_id, referenced_verse_id)
);

-- Create api_keys table
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
);

-- Create api_usage table
CREATE TABLE IF NOT EXISTS api_usage (
    id SERIAL PRIMARY KEY,
    api_key VARCHAR(255) NOT NULL,
    endpoint VARCHAR(100),
    tokens_used INTEGER,
    response_time_ms INTEGER,
    status_code INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create index for api_usage
CREATE INDEX IF NOT EXISTS idx_api_key_date ON api_usage(api_key, created_at);

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    api_key VARCHAR(255),
    messages JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for conversations (only if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_conversations_updated_at') THEN
        CREATE TRIGGER update_conversations_updated_at 
        BEFORE UPDATE ON conversations 
        FOR EACH ROW 
        EXECUTE FUNCTION update_updated_at_column();
    END IF;
END
$$;

-- Insert initial topics
INSERT INTO topics (topic, category, related_topics) VALUES
    ('Love', 'Character', ARRAY['Compassion', 'Kindness']),
    ('Faith', 'Spiritual Life', ARRAY['Trust', 'Belief']),
    ('Hope', 'Spiritual Life', ARRAY['Perseverance', 'Future']),
    ('Prayer', 'Spiritual Practices', ARRAY['Worship', 'Meditation']),
    ('Forgiveness', 'Relationships', ARRAY['Mercy', 'Grace']),
    ('Wisdom', 'Character', ARRAY['Knowledge', 'Understanding']),
    ('Peace', 'Spiritual Life', ARRAY['Rest', 'Comfort']),
    ('Joy', 'Emotions', ARRAY['Happiness', 'Celebration']),
    ('Patience', 'Character', ARRAY['Endurance', 'Waiting']),
    ('Healing', 'Health', ARRAY['Restoration', 'Wholeness'])
ON CONFLICT (topic) DO NOTHING;

-- Create a development API key
INSERT INTO api_keys (key, name, tier, monthly_limit) 
VALUES ('dev_key_' || substr(md5(random()::text), 0, 25), 'Development Key', 'premium', 100000)
ON CONFLICT DO NOTHING;

-- Insert sample verses
INSERT INTO verses (book, chapter, verse, text, translation, testament) VALUES
    ('John', 3, 16, 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.', 'NIV', 'NT'),
    ('Philippians', 4, 6, 'Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God.', 'NIV', 'NT'),
    ('Philippians', 4, 7, 'And the peace of God, which transcends all understanding, will guard your hearts and your minds in Christ Jesus.', 'NIV', 'NT'),
    ('Romans', 8, 28, 'And we know that in all things God works for the good of those who love him, who have been called according to his purpose.', 'NIV', 'NT'),
    ('Psalms', 23, 1, 'The Lord is my shepherd, I lack nothing.', 'NIV', 'OT'),
    ('Proverbs', 3, 5, 'Trust in the Lord with all your heart and lean not on your own understanding;', 'NIV', 'OT'),
    ('Isaiah', 41, 10, 'So do not fear, for I am with you; do not be dismayed, for I am your God. I will strengthen you and help you; I will uphold you with my righteous right hand.', 'NIV', 'OT'),
    ('Jeremiah', 29, 11, 'For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.', 'NIV', 'OT')
ON CONFLICT DO NOTHING;

-- Get your development API key
SELECT 'Your development API key is: ' || key as message FROM api_keys WHERE name = 'Development Key';