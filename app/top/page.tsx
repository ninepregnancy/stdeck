
'use client';

import React, { useEffect, useState } from 'react';
import { api } from '../../services/db-client';
import { LeaderboardItem, TimeWindow } from '../../types';
import { ExternalLink, Trophy, Flame } from 'lucide-react';

export default function TopPage() {
  const [items, setItems] = useState<LeaderboardItem[]>([]);
  const [window, setWindow] = useState<TimeWindow>('week');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(false);
      try {
        const data = await api.getLeaderboard(window);
        setItems(data);
      } catch (e) {
        console.error(e);
        setError(true);
      }
      setLoading(false);
    };
    load();
  }, [window]);

  const tabs: { id: TimeWindow; label: string }[] = [
    { id: 'day', label: 'Today' },
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'Month' },
    { id: 'all', label: 'All Time' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-3xl font-bold text-white flex items-center gap-2">
             <Trophy className="w-8 h-8 text-yellow-500" /> Leaderboard
           </h1>
           <p className="text-slate-400 mt-1">Top trending startups based on engagement.</p>
        </div>
        
        <div className="flex bg-slate-900 p-1 rounded-xl">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setWindow(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                window === tab.id 
                  ? 'bg-slate-700 text-white shadow' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
           {[1,2,3].map(i => (
             <div key={i} className="h-20 bg-slate-900/50 rounded-xl animate-pulse" />
           ))}
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-400">
           Failed to load data. Please check your connection.
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div 
              key={item.id}
              className="group flex items-center gap-4 bg-slate-900/40 border border-slate-800 p-4 rounded-xl hover:bg-slate-800/60 hover:border-slate-700 transition-all"
            >
              <div className={`w-10 flex-shrink-0 text-center font-bold text-xl ${
                item.rank === 1 ? 'text-yellow-500' :
                item.rank === 2 ? 'text-slate-300' :
                item.rank === 3 ? 'text-amber-700' : 'text-slate-600'
              }`}>
                #{item.rank}
              </div>

              <img 
                src={item.logo_url || `https://picsum.photos/50/50?seed=${item.id}`} 
                alt={item.title}
                className="w-12 h-12 rounded-lg object-cover bg-slate-800"
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-white font-semibold truncate">{item.title}</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                    {item.category}
                  </span>
                </div>
                <p className="text-slate-400 text-sm truncate">{item.description}</p>
              </div>

              <div className="hidden sm:flex items-center gap-6 text-sm text-slate-400">
                <div className="flex items-center gap-1.5" title="Likes">
                   <Flame className="w-4 h-4 text-orange-500" />
                   <span>{item.likes}</span>
                </div>
                <div className="flex items-center gap-1.5" title="Score">
                   <div className="font-mono text-indigo-400 font-medium">{item.score}</div>
                </div>
              </div>

              <a 
                href={item.url} 
                target="_blank" 
                rel="noreferrer"
                className="p-2 text-slate-500 hover:text-white transition-colors"
              >
                <ExternalLink className="w-5 h-5" />
              </a>
            </div>
          ))}
          
          {items.length === 0 && (
             <div className="text-center py-12 text-slate-500">
               No startups found for this time period.
             </div>
          )}
        </div>
      )}
    </div>
  );
}
