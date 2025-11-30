
import type { Config } from 'drizzle-kit';

export default {
  schema: './lib/schema.ts',
  out: './drizzle/migrations',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL || 'postgres://user:password@localhost:5432/startupdeck',
  },
} satisfies Config;
