export interface Startup {
  id: string;
  title: string;
  url: string;
  normalized_url: string;
  category: string;
  description: string;
  image_url?: string;
  logo_url?: string;
  created_at: string; // ISO string
  likes: number;
  visits: number;
  skips: number;
}

export interface Vote {
  id: string;
  startup_id: string;
  session_id: string;
  type: 'like' | 'skip';
  created_at: string;
}

export interface Visit {
  id: string;
  startup_id: string;
  session_id: string;
  created_at: string;
}

export interface SeenStartup {
  session_id: string;
  startup_id: string;
  viewed_at: string;
}

export type TimeWindow = 'day' | 'week' | 'month' | 'all';

export interface LeaderboardItem extends Startup {
  score: number;
  rank: number;
}
