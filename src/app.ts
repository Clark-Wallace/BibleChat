import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { API_PREFIX } from './utils/constants';
import logger from './utils/logger';
import { errorHandler, notFoundHandler, validationErrorHandler } from './api/middleware/error.middleware';
import v1Routes from './api/routes/v1';
import { initDatabase } from './models/database/database';
import redisService from './services/cache/redis.service';

dotenv.config();

export class App {
  public app: Application;

  constructor() {
    this.app = express();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    // Security middlewares
    this.app.use(helmet({
      crossOriginResourcePolicy: false,
    }));
    this.app.use(cors({
      origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5688', 'http://localhost:3000', 'http://localhost:3001'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    }));

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Compression
    this.app.use(compression());

    // Request logging
    this.app.use((req, _res, next) => {
      logger.info(`${req.method} ${req.path}`, {
        ip: req.ip,
        userAgent: req.get('user-agent'),
      });
      next();
    });

    // Handle preflight requests explicitly
    this.app.options('*', (_req, res) => {
      res.header('Access-Control-Allow-Origin', 'http://localhost:5688');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.header('Access-Control-Allow-Credentials', 'true');
      res.sendStatus(200);
    });

    // Health check endpoint (no auth required)
    this.app.get('/health', (_req, res) => {
      const dbStatus = initDatabase().then(connected => ({ connected }));
      const redisStatus = redisService.getStatus();
      
      Promise.resolve(dbStatus).then(db => {
        res.json({
          status: 'healthy',
          version: process.env.npm_package_version || '1.0.0',
          timestamp: new Date().toISOString(),
          services: {
            database: db,
            redis: redisStatus,
          },
        });
      });
    });

    // API documentation
    if (process.env.NODE_ENV !== 'production') {
      this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(undefined, {
        swaggerOptions: {
          url: '/api/v1/swagger.json',
        },
      }));
    }
  }

  private initializeRoutes(): void {
    // API v1 routes
    this.app.use(API_PREFIX, v1Routes);

    // Root endpoint
    this.app.get('/', (_req, res) => {
      res.json({
        name: 'BibleChat API',
        version: '1.0.0',
        description: 'AI-powered Biblical conversation API',
        documentation: process.env.NODE_ENV !== 'production' ? '/api-docs' : undefined,
        endpoints: {
          health: '/health',
          api: API_PREFIX,
        },
      });
    });
  }

  private initializeErrorHandling(): void {
    // 404 handler
    this.app.use(notFoundHandler);

    // Validation error handler
    this.app.use(validationErrorHandler);

    // General error handler
    this.app.use(errorHandler);
  }

  public async initialize(): Promise<void> {
    try {
      // Initialize database connection
      const dbConnected = await initDatabase();
      if (!dbConnected) {
        logger.error('Failed to connect to database - running in demo mode');
        // Continue anyway for testing
      }

      // Check Redis connection
      const redisStatus = redisService.getStatus();
      if (!redisStatus.connected) {
        logger.warn('Redis not connected - caching disabled');
      }

      logger.info('Application initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize application:', error);
      process.exit(1);
    }
  }

  public listen(port: number): void {
    this.app.listen(port, () => {
      logger.info(`Server is running on port ${port}`);
      logger.info(`API available at http://localhost:${port}${API_PREFIX}`);
      if (process.env.NODE_ENV !== 'production') {
        logger.info(`API documentation available at http://localhost:${port}/api-docs`);
      }
    });
  }
}

export default App;