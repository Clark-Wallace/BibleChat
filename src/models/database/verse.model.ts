import { query } from './database';
import { Verse } from '../types/response.types';

export class VerseModel {
  static async create(verse: Omit<Verse, 'id'>): Promise<Verse> {
    const text = `
      INSERT INTO verses (book, chapter, verse, text, translation, testament)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const values = [
      verse.book,
      verse.chapter,
      verse.verse,
      verse.text,
      verse.translation,
      verse.testament,
    ];
    const result = await query(text, values);
    return result.rows[0];
  }

  static async findByReference(
    book: string,
    chapter: number,
    verse: number,
    translation: string = 'NIV'
  ): Promise<Verse | null> {
    const text = `
      SELECT * FROM verses
      WHERE book = $1 AND chapter = $2 AND verse = $3 AND translation = $4
    `;
    const result = await query(text, [book, chapter, verse, translation]);
    return result.rows[0] || null;
  }

  static async findByReferenceRange(
    book: string,
    chapter: number,
    verseStart: number,
    verseEnd: number,
    translation: string = 'NIV'
  ): Promise<Verse[]> {
    const text = `
      SELECT * FROM verses
      WHERE book = $1 AND chapter = $2 
        AND verse >= $3 AND verse <= $4 
        AND translation = $5
      ORDER BY verse ASC
    `;
    const result = await query(text, [book, chapter, verseStart, verseEnd, translation]);
    return result.rows;
  }

  static async search(
    searchQuery: string,
    limit: number = 10,
    translation: string = 'NIV'
  ): Promise<Verse[]> {
    const text = `
      SELECT *, 
        ts_rank(to_tsvector('english', text), plainto_tsquery('english', $1)) AS rank
      FROM verses
      WHERE translation = $3
        AND to_tsvector('english', text) @@ plainto_tsquery('english', $1)
      ORDER BY rank DESC
      LIMIT $2
    `;
    const result = await query(text, [searchQuery, limit, translation]);
    return result.rows;
  }

  static async findByBook(book: string, translation: string = 'NIV'): Promise<Verse[]> {
    const text = `
      SELECT * FROM verses
      WHERE book = $1 AND translation = $2
      ORDER BY chapter, verse
    `;
    const result = await query(text, [book, translation]);
    return result.rows;
  }

  static async findByTopic(topicId: number, limit: number = 10): Promise<Verse[]> {
    const text = `
      SELECT v.*, tv.relevance_score
      FROM verses v
      JOIN topic_verses tv ON v.id = tv.verse_id
      WHERE tv.topic_id = $1
      ORDER BY tv.relevance_score DESC
      LIMIT $2
    `;
    const result = await query(text, [topicId, limit]);
    return result.rows;
  }

  static async getRandom(translation: string = 'NIV'): Promise<Verse | null> {
    const text = `
      SELECT * FROM verses
      WHERE translation = $1
      ORDER BY RANDOM()
      LIMIT 1
    `;
    const result = await query(text, [translation]);
    return result.rows[0] || null;
  }

  static async createBulk(verses: Omit<Verse, 'id'>[]): Promise<number> {
    const values: any[] = [];
    const placeholders: string[] = [];
    
    verses.forEach((verse, index) => {
      const base = index * 6;
      placeholders.push(
        `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6})`
      );
      values.push(
        verse.book,
        verse.chapter,
        verse.verse,
        verse.text,
        verse.translation,
        verse.testament
      );
    });

    const text = `
      INSERT INTO verses (book, chapter, verse, text, translation, testament)
      VALUES ${placeholders.join(', ')}
      ON CONFLICT (book, chapter, verse, translation) DO NOTHING
    `;
    
    const result = await query(text, values);
    return result.rowCount ?? 0;
  }
}