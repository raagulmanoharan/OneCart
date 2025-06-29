import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ DATABASE_URL is not configured!');
  console.error('Please add DATABASE_URL to your .env file.');
  console.error('Format: postgresql://username:password@host/database?sslmode=require');
  console.error('You can get this from your Neon dashboard at https://neon.tech');
  process.exit(1);
}

// Validate that it's a proper PostgreSQL URL
try {
  const url = new URL(databaseUrl);
  if (!url.protocol.startsWith('postgres')) {
    throw new Error('Invalid protocol');
  }
  if (!url.hostname || !url.username || !url.password) {
    throw new Error('Missing required connection parameters');
  }
} catch (error) {
  console.error('❌ DATABASE_URL is not properly formatted!');
  console.error('Current value appears to be invalid.');
  console.error('Format: postgresql://username:password@host/database?sslmode=require');
  console.error('You can get this from your Neon dashboard at https://neon.tech');
  process.exit(1);
}

export const pool = new Pool({ connectionString: databaseUrl });
export const db = drizzle({ client: pool, schema });