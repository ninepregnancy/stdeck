
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { startups, votes, visits, startupStats } from '@/lib/schema';
import { eq, and, gte, count, sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(req: Request) {
  try {
    const now = new Date();
    
    // Define Time Windows (ISO strings for safer comparison)
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

    // 1. Get all startups (to ensure we have rows for everyone)
    const allStartups = await db.select({ id: startups.id }).from(startups);
    
    // Initialize stats map
    const statsMap = new Map<string, {
      likesDay: number; likesWeek: number; likesMonth: number;
      visitsDay: number; visitsWeek: number; visitsMonth: number;
    }>();

    for (const s of allStartups) {
      statsMap.set(s.id, {
        likesDay: 0, likesWeek: 0, likesMonth: 0,
        visitsDay: 0, visitsWeek: 0, visitsMonth: 0,
      });
    }

    // 2. Fetch Aggregates using clean Drizzle queries
    // We execute separate queries to avoid complex joins and raw SQL issues
    
    const mergeCounts = async (
      table: typeof votes | typeof visits, 
      dateField: any, 
      cutoff: string, 
      fieldKey: string,
      typeFilter?: string
    ) => {
      const conditions = [gte(dateField, cutoff)];
      if (typeFilter && table === votes) {
        conditions.push(eq((table as typeof votes).type, 'like'));
      }

      const results = await db
        .select({ 
          startupId: table.startupId, 
          count: count() 
        })
        .from(table)
        .where(and(...conditions))
        .groupBy(table.startupId);

      for (const row of results) {
        const current = statsMap.get(row.startupId);
        if (current) {
          (current as any)[fieldKey] = row.count;
        }
      }
    };

    // Parallel execution for efficiency
    await Promise.all([
      mergeCounts(votes, votes.createdAt, dayAgo, 'likesDay', 'like'),
      mergeCounts(votes, votes.createdAt, weekAgo, 'likesWeek', 'like'),
      mergeCounts(votes, votes.createdAt, monthAgo, 'likesMonth', 'like'),
      
      mergeCounts(visits, visits.createdAt, dayAgo, 'visitsDay'),
      mergeCounts(visits, visits.createdAt, weekAgo, 'visitsWeek'),
      mergeCounts(visits, visits.createdAt, monthAgo, 'visitsMonth'),
    ]);

    // 3. Prepare data for bulk upsert
    const upsertData = [];
    for (const [id, s] of statsMap.entries()) {
      upsertData.push({
        startupId: id,
        likesDay: s.likesDay,
        likesWeek: s.likesWeek,
        likesMonth: s.likesMonth,
        visitsDay: s.visitsDay,
        visitsWeek: s.visitsWeek,
        visitsMonth: s.visitsMonth,
        scoreDay: (s.likesDay * 1) + (s.visitsDay * 2),
        scoreWeek: (s.likesWeek * 1) + (s.visitsWeek * 2),
        scoreMonth: (s.likesMonth * 1) + (s.visitsMonth * 2),
        updatedAt: new Date(),
      });
    }

    if (upsertData.length === 0) {
      return NextResponse.json({ updated: 0 });
    }

    // 4. Upsert into startupStats
    await db.insert(startupStats)
      .values(upsertData)
      .onConflictDoUpdate({
        target: startupStats.startupId,
        set: {
          likesDay: sql`excluded.likes_day`,
          likesWeek: sql`excluded.likes_week`,
          likesMonth: sql`excluded.likes_month`,
          visitsDay: sql`excluded.visits_day`,
          visitsWeek: sql`excluded.visits_week`,
          visitsMonth: sql`excluded.visits_month`,
          scoreDay: sql`excluded.score_day`,
          scoreWeek: sql`excluded.score_week`,
          scoreMonth: sql`excluded.score_month`,
          updatedAt: new Date(),
        }
      });

    return NextResponse.json({ updated: upsertData.length });
  } catch (error: any) {
    console.error('Recompute Error:', error);
    return NextResponse.json({ error: 'Failed to recompute stats', details: error.message }, { status: 500 });
  }
}
