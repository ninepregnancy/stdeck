
import { db } from '@/lib/db';
import { votes } from '@/lib/schema';
import { checkAbuse } from '@/lib/abuse';
import { hashIpUa } from '@/lib/hash';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sessionId, startupId, type } = body;
    
    // Safely get origin
    let origin = '';
    try {
        origin = new URL(req.url).origin;
    } catch (e) {
        origin = 'http://localhost:3000'; // Fallback
    }

    if (!sessionId || !startupId || !['like', 'skip'].includes(type)) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    // Simulate IP/UA extraction (In prod, use headers())
    const ip = '127.0.0.1'; // Mock for preview
    const ua = 'SimulatedClient'; 
    const hash = await hashIpUa(ip, ua);

    // Abuse Check
    const abuse = await checkAbuse(sessionId, hash, hash, startupId);
    if (!abuse.allowed) {
      return NextResponse.json({ error: abuse.reason }, { status: 429 });
    }

    // Insert Vote (Unique constraint handles duplicates)
    await db.insert(votes).values({
      sessionId,
      startupId,
      type,
      ipHash: hash,
      uaHash: hash
    });

    // Fire-and-forget stats recomputation
    if (origin) {
        fetch(`${origin}/api/admin/recompute-stats`, { method: 'POST' }).catch(err => {
          console.error("Background recompute failed:", err);
        });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    if (error.code === '23505') { // Postgres Unique Constraint Violation
       return NextResponse.json({ error: 'Already voted' }, { status: 400 });
    }
    console.error('Vote Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}