import { Pool, PoolConfig } from 'pg';
import logger from '../../utils/logger';

let pool: Pool | null = null;

const getPool = () => {
  if (!pool) {
    const poolConfig: PoolConfig = {
      connectionString: process.env.DATABASE_URL,
      max: parseInt(process.env.DATABASE_POOL_SIZE || '10', 10),
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    };
    
    console.log('Creating pool with DATABASE_URL:', process.env.DATABASE_URL?.substring(0, 50) + '...');
    pool = new Pool(poolConfig);
    
    pool.on('error', (err) => {
      logger.error('Unexpected database error:', err);
    });
  }
  return pool;
};

export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  try {
    const res = await getPool().query(text, params);
    const duration = Date.now() - start;
    logger.debug('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    logger.error('Database query error:', { text, error });
    throw error;
  }
};

export const getClient = () => getPool().connect();

export const transaction = async <T>(callback: (client: any) => Promise<T>): Promise<T> => {
  const client = await getClient();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const initDatabase = async () => {
  try {
    await query('SELECT 1');
    logger.info('Database connection established');
    return true;
  } catch (error) {
    logger.error('Failed to connect to database:', error);
    return false;
  }
};

// Export pool for compatibility
export { getPool as pool };