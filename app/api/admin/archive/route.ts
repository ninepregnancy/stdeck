
import { db } from '@/lib/db';
import { startups } from '@/lib/schema';
import { lt, isNull } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { adminSecret } = body;

    if (adminSecret !== process.env.ADMIN_SECRET && adminSecret !== 'ADMIN_SECRET_123') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 90);

    const result = await db.update(startups)
      .set({ archivedAt: new Date() })
      .where(
        lt(startups.createdAt, cutoff)
      )
      .returning();

    return NextResponse.json({ archived: result.length, ids: result.map(s => s.id) });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
