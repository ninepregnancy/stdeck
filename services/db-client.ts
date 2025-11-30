
import { Startup, LeaderboardItem, TimeWindow } from '../types';

// Client-side API wrapper using fetch to talk to Next.js API routes
export const api = {
  createStartup: async (data: any) => {
    const res = await fetch('/api/startups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to create startup');
    return res.json();
  },

  getRandomStartup: async (sessionId: string): Promise<Startup | null> => {
    const res = await fetch(`/api/startups/random?sessionId=${sessionId}`);
    if (!res.ok) {
        if (res.status === 404) return null;
        throw new Error('Failed to fetch startup');
    }
    return res.json();
  },

  vote: async (sessionId: string, startupId: string, type: 'like' | 'skip') => {
    const res = await fetch('/api/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, startupId, type }),
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Vote failed');
    return res.json();
  },

  visit: async (sessionId: string, startupId: string) => {
    const res = await fetch('/api/visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, startupId }),
    });
    if (!res.ok) throw new Error('Visit record failed');
    return res.json();
  },

  getLeaderboard: async (window: TimeWindow = 'week', category?: string): Promise<LeaderboardItem[]> => {
    const qs = new URLSearchParams({ window });
    if (category && category !== 'All') qs.append('category', category);
    
    const res = await fetch(`/api/top?${qs.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch leaderboard');
    return res.json();
  }
};
