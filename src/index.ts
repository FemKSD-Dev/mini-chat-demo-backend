import express, { Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler.middleware';
import { currentUser } from './middleware/currentUser.middleware';
import { apiRouter } from './routes';

dotenv.config();

/**
 * Create Express app instance
 * Exported for testing purposes
 */
export function createApp(): Express {
  const app = express();
  const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';

  // Middleware
  app.use(cors({
    origin: CORS_ORIGIN,
    credentials: true
  }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(currentUser);

  // Routes
  app.use('/api', apiRouter);

  // Error handling middleware (must be last)
  app.use(errorHandler);

  return app;
}

// Start server only if this file is run directly
if (require.main === module) {
  const app = createApp();
  const PORT = process.env.PORT || 4001;
  
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📡 CORS enabled for: ${process.env.CORS_ORIGIN || 'http://localhost:3000'}`);
  });
}
