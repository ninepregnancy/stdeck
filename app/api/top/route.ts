import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { startups, startupStats } from "@/lib/schema";
import { eq, desc, and, isNull } from "drizzle-orm";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const window = (searchParams.get("window") || "day").toLowerCase();
    const category = searchParams.get("category");

    // Determine sort column based on window
    let sortColumn: any = startupStats.scoreDay;
    if (window === "week") sortColumn = startupStats.scoreWeek;
    else if (window === "month") sortColumn = startupStats.scoreMonth;
    else if (window === "all") sortColumn = startupStats.scoreMonth;

    // Build filters
    const filters = [eq(startups.id, startupStats.startupId), isNull(startups.archivedAt)];
    if (category && category !== 'All') {
      filters.push(eq(startups.category, category));
    }

    // Fetch from precomputed stats joined with startups
    // This is O(1) complexity per row compared to on-the-fly aggregation
    const result = await db
      .select({
        id: startups.id,
        title: startups.title,
        url: startups.url,
        category: startups.category,
        description: startups.description,
        imageUrl: startups.imageUrl,
        logoUrl: startups.logoUrl,
        createdAt: startups.createdAt,
        // Select appropriate precomputed fields
        likes: window === 'week' ? startupStats.likesWeek : 
               (window === 'month' || window === 'all') ? startupStats.likesMonth : 
               startupStats.likesDay,
        visits: window === 'week' ? startupStats.visitsWeek : 
                (window === 'month' || window === 'all') ? startupStats.visitsMonth : 
                startupStats.visitsDay,
        score: sortColumn,
      })
      .from(startupStats)
      .innerJoin(startups, and(...filters))
      .orderBy(desc(sortColumn))
      .limit(100);

    // Add rank index
    const list = result.map((item, index) => ({
      ...item,
      likes: item.likes || 0,
      visits: item.visits || 0,
      score: item.score || 0,
      rank: index + 1
    }));

    return NextResponse.json(list);

  } catch (err: any) {
    console.error("Error in /api/top:", err);
    return NextResponse.json(
      { error: "Internal server error", details: String(err?.message ?? err) },
      { status: 500 }
    );
  }
}