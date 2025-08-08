import dotenv from 'dotenv';
dotenv.config();

import App from './app';
import logger from './utils/logger';

const PORT = parseInt(process.env.PORT || '3001', 10);

// Debug: Check if env vars are loaded
console.log('Environment check:', {
  hasDbUrl: !!process.env.DATABASE_URL,
  dbUrlStart: process.env.DATABASE_URL?.substring(0, 30),
  hasOpenAI: !!process.env.OPENAI_API_KEY,
  nodeEnv: process.env.NODE_ENV,
});

async function startServer() {
  try {
    const app = new App();
    
    // Initialize application (database, redis, etc.)
    await app.initialize();
    
    // Start listening
    app.listen(PORT);
    
    // Graceful shutdown
    process.on('SIGTERM', async () => {
      logger.info('SIGTERM signal received: closing HTTP server');
      process.exit(0);
    });
    
    process.on('SIGINT', async () => {
      logger.info('SIGINT signal received: closing HTTP server');
      process.exit(0);
    });
    
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    });
    
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      process.exit(1);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();