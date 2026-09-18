import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createApiApp } from './app.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = createApiApp();
const PORT = Number(process.env.PORT) || 3000;
const DIST_PATH = path.resolve(__dirname, '../dist');

// Serve static frontend in production
app.use(express.static(DIST_PATH));

// SPA fallback: any non-API route serves index.html
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(DIST_PATH, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`WH!TE L!E server running on http://0.0.0.0:${PORT}`);
});
