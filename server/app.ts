import express from 'express';
import { initDatabase } from './db.js';
import { router as apiRouter } from './routes.js';

export function createApiApp() {
  initDatabase();
  const app = express();
  app.use(express.json());
  app.use('/api', apiRouter);
  return app;
}
