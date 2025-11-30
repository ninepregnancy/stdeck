
import { pgTable, uuid, varchar, text, timestamp, integer, unique, serial } from 'drizzle-orm/pg-core';

// STARTUPS TABLE
export const startups = pgTable('startups', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: varchar('title', { length: 120 }).notNull(),
  url: text('url').notNull(),
  normalizedUrl: text('normalized_url').notNull(),
  urlHash: text('url_hash').unique().notNull(),
  category: varchar('category', { length: 50 }).notNull(),
  description: varchar('description', { length: 255 }).notNull(),
  imageUrl: text('image_url'),
  logoUrl: text('logo_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  archivedAt: timestamp('archived_at'),
});

// STARTUP STATS TABLE (New)
export const startupStats = pgTable('startup_stats', {
  id: serial('id').primaryKey(),
  startupId: uuid('startup_id').references(() => startups.id).notNull().unique(),
  
  likesDay: integer('likes_day').default(0).notNull(),
  likesWeek: integer('likes_week').default(0).notNull(),
  likesMonth: integer('likes_month').default(0).notNull(),
  
  visitsDay: integer('visits_day').default(0).notNull(),
  visitsWeek: integer('visits_week').default(0).notNull(),
  visitsMonth: integer('visits_month').default(0).notNull(),
  
  scoreDay: integer('score_day').default(0).notNull(),
  scoreWeek: integer('score_week').default(0).notNull(),
  scoreMonth: integer('score_month').default(0).notNull(),
  
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// VOTES TABLE
export const votes = pgTable('votes', {
  id: uuid('id').defaultRandom().primaryKey(),
  startupId: uuid('startup_id').references(() => startups.id).notNull(),
  sessionId: varchar('session_id', { length: 64 }).notNull(),
  type: varchar('type', { enum: ['like', 'skip'] }).notNull(),
  ipHash: varchar('ip_hash', { length: 64 }),
  uaHash: varchar('ua_hash', { length: 64 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  unq: unique().on(t.startupId, t.sessionId),
}));

// VISITS TABLE
export const visits = pgTable('visits', {
  id: uuid('id').defaultRandom().primaryKey(),
  startupId: uuid('startup_id').references(() => startups.id).notNull(),
  sessionId: varchar('session_id', { length: 64 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// SEEN STARTUPS TABLE
export const seenStartups = pgTable('seen_startups', {
  id: uuid('id').defaultRandom().primaryKey(),
  sessionId: varchar('session_id', { length: 64 }).notNull(),
  startupId: uuid('startup_id').references(() => startups.id).notNull(),
  viewedAt: timestamp('viewed_at').defaultNow().notNull(),
}, (t) => ({
  unq: unique().on(t.sessionId, t.startupId),
}));

// RATE LIMITS TABLE
export const rateLimits = pgTable('rate_limits', {
  key: varchar('key').primaryKey(),
  count: integer('count').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
});
