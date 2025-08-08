import { VerseModel } from '../../models/database/verse.model';
import { TopicModel } from '../../models/database/topic.model';
import logger from '../../utils/logger';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

interface VerseData {
  book: string;
  chapter: number;
  verse: number;
  text: string;
  translation: string;
  testament: 'OT' | 'NT';
}

const loadSampleVerses = async () => {
  try {
    const dataPath = path.join(__dirname, '../seeds/sample-verses.json');
    const data = fs.readFileSync(dataPath, 'utf-8');
    const verses: VerseData[] = JSON.parse(data);
    
    logger.info(`Loading ${verses.length} sample verses...`);
    
    const insertedCount = await VerseModel.createBulk(verses);
    logger.info(`Successfully inserted ${insertedCount} verses`);
    
    // Create topic associations for sample verses
    await createTopicAssociations();
    
    return insertedCount;
  } catch (error) {
    logger.error('Error loading sample verses:', error);
    throw error;
  }
};

const createTopicAssociations = async () => {
  try {
    // Map verses to topics based on content
    const topicMappings = [
      { topic: 'Love', verses: ['John 3:16', '1 Corinthians 13:4', '1 Corinthians 13:5'] },
      { topic: 'Faith', verses: ['Ephesians 2:8', 'Proverbs 3:5', 'Proverbs 3:6'] },
      { topic: 'Peace', verses: ['Philippians 4:7', 'Isaiah 41:10', 'Psalms 23:1'] },
      { topic: 'Prayer', verses: ['Philippians 4:6', 'Matthew 6:33'] },
      { topic: 'Hope', verses: ['Jeremiah 29:11', 'Romans 8:28'] },
      { topic: 'Joy', verses: ['Galatians 5:22', 'Psalms 23:1'] },
      { topic: 'Wisdom', verses: ['Proverbs 3:5', 'Proverbs 3:6'] },
      { topic: 'Healing', verses: ['Psalms 34:18', 'Isaiah 41:10'] },
    ];
    
    for (const mapping of topicMappings) {
      const topic = await TopicModel.findByName(mapping.topic);
      if (!topic) continue;
      
      for (const verseRef of mapping.verses) {
        const [book, chapterVerse] = verseRef.split(' ');
        const [chapter, verse] = chapterVerse.split(':').map(Number);
        
        const verseRecord = await VerseModel.findByReference(book, chapter, verse);
        if (verseRecord && verseRecord.id) {
          await TopicModel.addVerseToTopic(topic.id!, verseRecord.id, 0.8);
        }
      }
    }
    
    logger.info('Topic associations created successfully');
  } catch (error) {
    logger.error('Error creating topic associations:', error);
  }
};

const loadFromExternalSource = async (filePath: string) => {
  try {
    // This function can be extended to load from various Bible databases
    // For now, it loads from a JSON file
    const data = fs.readFileSync(filePath, 'utf-8');
    const verses: VerseData[] = JSON.parse(data);
    
    logger.info(`Loading ${verses.length} verses from ${filePath}...`);
    
    // Process in batches to avoid memory issues
    const batchSize = 100;
    let totalInserted = 0;
    
    for (let i = 0; i < verses.length; i += batchSize) {
      const batch = verses.slice(i, i + batchSize);
      const insertedCount = await VerseModel.createBulk(batch);
      totalInserted += insertedCount;
      logger.info(`Progress: ${i + batch.length}/${verses.length} verses processed`);
    }
    
    logger.info(`Successfully loaded ${totalInserted} verses`);
    return totalInserted;
  } catch (error) {
    logger.error('Error loading verses from external source:', error);
    throw error;
  }
};

const seedDatabase = async () => {
  logger.info('Starting Bible data seeding...');
  
  try {
    // Check if verses already exist
    const existingVerses = await VerseModel.search('God', 1);
    if (existingVerses.length > 0) {
      logger.info('Verses already exist in database, skipping seed');
      return;
    }
    
    // Load sample verses
    await loadSampleVerses();
    
    // If you have a full Bible database file, load it here
    // await loadFromExternalSource('./path/to/full-bible.json');
    
    logger.info('Bible data seeding completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Bible data seeding failed:', error);
    process.exit(1);
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

export { loadSampleVerses, loadFromExternalSource, createTopicAssociations };