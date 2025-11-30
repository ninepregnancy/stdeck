
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL!;

// Safe fallback for build time or missing env
const sql = neon(connectionString || 'postgres://placeholder:placeholder@localhost:5432/placeholder');

export const db = drizzle(sql, { schema });
