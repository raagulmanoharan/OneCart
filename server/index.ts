import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables from .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env') });

import express from 'express';
import { createServer } from 'http';
import { setupVite, serveStatic } from './vite.js';
import { setupAuth } from './auth.js';
import { db } from './db.js';
import { apiRoutes } from './routes.js';

const app = express();
const server = createServer(app);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setup authentication
setupAuth(app);

// API routes
app.use('/api', apiRoutes);

// Setup Vite or serve static files
if (process.env.NODE_ENV === 'development') {
  await setupVite(app, server);
} else {
  serveStatic(app);
}

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  
  // Test database connection
  if (process.env.DATABASE_URL) {
    console.log('✅ DATABASE_URL is configured');
  } else {
    console.log('❌ DATABASE_URL is not configured!');
    console.log('Please add DATABASE_URL to your .env file.');
    console.log('Format: postgresql://username:password@host/database?sslmode=require');
    console.log('You can get this from your Neon dashboard at https://neon.tech');
  }
});