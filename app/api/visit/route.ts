
import { db } from '@/lib/db';
import { visits } from '@/lib/schema';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sessionId, startupId } = body;
    
    // Safely get origin
    let origin = '';
    try {
        origin = new URL(req.url).origin;
    } catch (e) {
        origin = 'http://localhost:3000'; // Fallback
    }

    if (!sessionId || !startupId) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    await db.insert(visits).values({
      sessionId,
      startupId
    });

    // Fire-and-forget stats recomputation
    if (origin) {
        fetch(`${origin}/api/admin/recompute-stats`, { method: 'POST' }).catch(err => {
           console.error("Background recompute failed:", err);
        });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('Visit Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}