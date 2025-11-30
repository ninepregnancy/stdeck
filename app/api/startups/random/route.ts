
import { db } from '@/lib/db';
import { startups, seenStartups } from '@/lib/schema';
import { pickWinner } from '@/lib/random-feed';
import { eq, notInArray, and, isNull } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
    }

    // Get IDs of startups seen by this session
    const seen = await db.select({ startupId: seenStartups.startupId })
      .from(seenStartups)
      .where(eq(seenStartups.sessionId, sessionId));
    
    const seenIds = seen.map(s => s.startupId);

    // Fetch Candidates (Not seen)
    // Note: If seenIds is empty, notInArray throws error in some Drizzle versions, so handle empty case
    let candidates;
    if (seenIds.length > 0) {
      candidates = await db.select().from(startups)
        .where(
          and(
            notInArray(startups.id, seenIds),
            isNull(startups.archivedAt)
          )
        );
    } else {
      candidates = await db.select().from(startups)
        .where(isNull(startups.archivedAt));
    }

    // Pick Weighted Winner
    const winner = pickWinner(candidates);

    if (winner) {
      // Mark as seen immediately so it doesn't appear again
      await db.insert(seenStartups).values({
        sessionId,
        startupId: winner.id
      }).onConflictDoNothing();
      
      // Transform for frontend
      return NextResponse.json({
        ...winner,
        image_url: winner.imageUrl,
        logo_url: winner.logoUrl,
        created_at: winner.createdAt,
        normalized_url: winner.normalizedUrl
      });
    }

    return NextResponse.json(null, { status: 404 });
  } catch (error: any) {
    console.error('Random Feed Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
