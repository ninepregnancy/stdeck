
import { LeaderboardItem, TimeWindow } from '../types';

interface ScorableStartup {
  id: string;
  title: string;
  category: string;
  description: string;
  logoUrl: string | null;
  url: string;
  createdAt: Date;
  voteCount: number; // likes in window
  visitCount: number; // visits in window
}

export function calculateTrending(
  items: ScorableStartup[]
): LeaderboardItem[] {
  
  const ranked = items.map(item => {
    // Score Algorithm: 1 Like = 1 Point, 1 Visit = 2 Points
    const score = (Number(item.voteCount) * 1) + (Number(item.visitCount) * 2);

    return {
      id: item.id,
      title: item.title,
      url: item.url,
      normalized_url: '', // Not strictly needed for UI display
      category: item.category,
      description: item.description,
      logo_url: item.logoUrl || undefined,
      created_at: item.createdAt.toISOString(),
      likes: Number(item.voteCount),
      visits: Number(item.visitCount),
      skips: 0,
      score,
      rank: 0
    };
  });

  // Sort: Score DESC, then CreatedAt DESC
  ranked.sort((a, b) => 
    b.score - a.score || 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  // Assign Rank
  return ranked.map((item, index) => ({ ...item, rank: index + 1 }));
}
