import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl || databaseUrl.includes('username:password@localhost')) {
  console.error('❌ DATABASE_URL is not properly configured!');
  console.error('Please update your .env file with a valid Neon database URL.');
  console.error('Format: postgresql://username:password@host/database?sslmode=require');
  console.error('You can get this from your Neon dashboard at https://neon.tech');
  process.exit(1);
}

export const pool = new Pool({ connectionString: databaseUrl });
export const db = drizzle({ client: pool, schema });