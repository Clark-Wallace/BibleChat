import { readFileSync } from 'fs';
import { query } from '../../models/database/database';
import logger from '../../utils/logger';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

interface BibleBook {
  abbrev: string;
  chapters: string[][];
  name: string;
}

// Map to determine testament
const OLD_TESTAMENT_BOOKS = new Set([
  'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy', 'Joshua', 'Judges', 'Ruth',
  '1 Samuel', '2 Samuel', '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles', 'Ezra',
  'Nehemiah', 'Esther', 'Job', 'Psalms', 'Proverbs', 'Ecclesiastes', 'Song of Solomon',
  'Isaiah', 'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos',
  'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 'Malachi'
]);

async function insertBatch(batch: any[]) {
  if (batch.length === 0) return;
  
  const values = batch.map((_, i) => {
    const offset = i * 6;
    return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6})`;
  }).join(',');
  
  const flatValues = batch.flat();
  
  await query(
    `INSERT INTO verses (book, chapter, verse, text, translation, testament)
     VALUES ${values}
     ON CONFLICT (book, chapter, verse, translation) DO UPDATE
     SET text = EXCLUDED.text`,
    flatValues
  );
}

async function importBible() {
  try {
    logger.info('Starting Bible import...');
    
    // Read the Bible JSON file
    const biblePath = path.join(process.cwd(), 'bible_kjv.json');
    const bibleData: BibleBook[] = JSON.parse(readFileSync(biblePath, 'utf-8'));
    
    logger.info(`Loaded ${bibleData.length} books from Bible JSON`);
    
    // Clear existing verses (except our sample verses if you want to keep them)
    logger.info('Clearing existing verses...');
    await query('DELETE FROM verses WHERE translation = $1', ['KJV']);
    
    let totalVerses = 0;
    let processedBooks = 0;
    const batchSize = 500; // Insert in batches
    let batch: any[] = [];
    
    // Process each book
    for (const book of bibleData) {
      const bookName = book.name;
      const testament = OLD_TESTAMENT_BOOKS.has(bookName) ? 'OT' : 'NT';
      let bookVerseCount = 0;
      
      // Process each chapter
      for (let chapterIndex = 0; chapterIndex < book.chapters.length; chapterIndex++) {
        const chapter = book.chapters[chapterIndex];
        const chapterNumber = chapterIndex + 1;
        
        // Process each verse
        for (let verseIndex = 0; verseIndex < chapter.length; verseIndex++) {
          const verseText = chapter[verseIndex];
          const verseNumber = verseIndex + 1;
          
          // Clean the verse text (remove annotations in curly braces)
          const cleanedText = verseText.replace(/\{[^}]*\}/g, '').trim();
          
          if (cleanedText) {
            batch.push([bookName, chapterNumber, verseNumber, cleanedText, 'KJV', testament]);
            bookVerseCount++;
            totalVerses++;
            
            // Insert batch when it reaches the size limit
            if (batch.length >= batchSize) {
              await insertBatch(batch);
              batch = [];
            }
          }
        }
      }
      
      processedBooks++;
      logger.info(`Processed ${bookName}: ${bookVerseCount} verses (${processedBooks}/${bibleData.length} books)`);
    }
    
    // Insert remaining verses
    if (batch.length > 0) {
      await insertBatch(batch);
    }
    
    logger.info(`Bible import completed! Total verses imported: ${totalVerses}`);
    
    // Verify the import
    const countResult = await query('SELECT COUNT(*) FROM verses WHERE translation = $1', ['KJV']);
    logger.info(`Verification: ${countResult.rows[0].count} verses in database`);
    
    // Update the full-text search index
    logger.info('Updating search index...');
    await query(`
      UPDATE verses 
      SET search_vector = to_tsvector('english', book || ' ' || chapter || ' ' || verse || ' ' || text)
      WHERE translation = 'KJV'
    `);
    
    logger.info('Search index updated successfully!');
    
  } catch (error) {
    logger.error('Error importing Bible:', error);
    process.exit(1);
  }
}

// Run the import
importBible().then(() => {
  logger.info('Import process finished');
  process.exit(0);
}).catch(error => {
  logger.error('Fatal error:', error);
  process.exit(1);
});