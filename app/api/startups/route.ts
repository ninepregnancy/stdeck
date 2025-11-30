
import { db } from '@/lib/db';
import { startups } from '@/lib/schema';
import { normalizeUrl } from '@/lib/url-normalize';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, url, category, description, image_url } = body;
    
    // Safely get origin
    let origin = '';
    try {
        origin = new URL(req.url).origin;
    } catch (e) {
        origin = 'http://localhost:3000'; // Fallback
    }

    if (!title || !url || !category || !description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // URL Normalization
    const { url: finalUrl, normalized, hash } = await normalizeUrl(url);

    // Duplicate Check
    const existing = await db.select().from(startups).where(eq(startups.urlHash, hash));
    if (existing.length > 0) {
      return NextResponse.json({ error: 'Startup already exists' }, { status: 409 });
    }

    // Insert
    const [newStartup] = await db.insert(startups).values({
      title,
      url: finalUrl,
      normalizedUrl: normalized,
      urlHash: hash,
      category,
      description,
      imageUrl: image_url,
      logoUrl: `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(title)}`,
    }).returning();

    // Trigger recompute stats so the new startup appears in leaderboard immediately
    if (origin) {
        fetch(`${origin}/api/admin/recompute-stats`, { method: 'POST' }).catch(err => {
           console.error("Background recompute failed:", err);
        });
    }

    return NextResponse.json(newStartup, { status: 201 });
  } catch (error: any) {
    console.error('Create Startup Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}