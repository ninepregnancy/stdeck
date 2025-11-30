
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '../components/Button';
import { api } from '../services/db-client';
import { LeaderboardItem, TimeWindow } from '../types';
import { ArrowRight, Zap, Trophy, Flame, ExternalLink, Filter } from 'lucide-react';

export default function Home() {
  const [items, setItems] = useState<LeaderboardItem[]>([]);
  const [window, setWindow] = useState<TimeWindow>('week');
  const [category, setCategory] = useState<string>('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(false);
      try {
        const data = await api.getLeaderboard(window, category);
        setItems(data);
      } catch (e) {
        console.error("Failed to load leaderboard:", e);
        setError(true);
      }
      setLoading(false);
    };
    load();
  }, [window, category]);

  const categories = ['All', 'SaaS', 'AI Tools', 'DevTools', 'Fintech', 'Health', 'Consumer'];

  return (
    <div className="flex flex-col items-center justify-center space-y-16 py-10">
      
      {/* Hero Section */}
      <div className="text-center space-y-6 max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium">
          <Zap className="w-3 h-3" />
          <span>Discover the next unicorn today</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400">
          Swipe. Discover. <br className="hidden md:block" /> Launch.
        </h1>
        <p className="text-lg text-slate-400 max-w-lg mx-auto">
          The fastest way to discover trending startups. 
          Swipe through curated decks, vote on your favorites, and watch the leaderboard rise.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Link href="/browse">
            <Button size="lg" className="w-full sm:w-auto shadow-indigo-500/20">
              Start Swiping <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
          <Link href="/add">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto">
              Submit Startup
            </Button>
          </Link>
        </div>
      </div>

      {/* Leaderboard Section */}
      <div className="w-full max-w-4xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
             <h2 className="text-2xl font-bold text-white flex items-center gap-2">
               <Trophy className="w-6 h-6 text-yellow-500" /> Trending Startups
             </h2>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Category Filter */}
            <div className="relative">
               <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
               <select 
                 value={category}
                 onChange={(e) => setCategory(e.target.value)}
                 className="pl-9 pr-4 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 outline-none appearance-none cursor-pointer hover:border-slate-700 w-full"
               >
                 {categories.map(c => <option key={c} value={c}>{c}</option>)}
               </select>
            </div>

            {/* Time Window Tabs */}
            <div className="flex bg-slate-900 p-1 rounded-lg">
              {(['day', 'week', 'month'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setWindow(tab)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    window === tab 
                      ? 'bg-slate-700 text-white shadow' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table/List */}
        <div className="bg-slate-900/30 rounded-2xl border border-slate-800 overflow-hidden">
          {loading ? (
             <div className="space-y-4 p-4">
               {[1,2,3].map(i => <div key={i} className="h-16 bg-slate-800/50 rounded-lg animate-pulse" />)}
             </div>
          ) : error ? (
            <div className="p-8 text-center text-red-400">
              Failed to load trending startups. Please try again later.
            </div>
          ) : (
             <div className="divide-y divide-slate-800/50">
                {items.length === 0 ? (
                  <div className="p-8 text-center text-slate-500">No startups found in this category.</div>
                ) : (
                  items.map((item, idx) => (
                    <div key={item.id} className="p-4 flex items-center gap-4 hover:bg-slate-800/30 transition-colors group">
                       {/* Rank */}
                       <div className={`w-8 text-center font-bold text-lg ${
                         idx === 0 ? 'text-yellow-500' : 
                         idx === 1 ? 'text-slate-300' : 
                         idx === 2 ? 'text-amber-700' : 'text-slate-600'
                       }`}>
                         {idx + 1}
                       </div>
                       
                       {/* Logo */}
                       <img 
                          src={item.logo_url || `https://api.dicebear.com/7.x/shapes/svg?seed=${item.id}`}
                          alt={item.title}
                          className="w-12 h-12 rounded-xl bg-slate-800 object-cover"
                       />
                       
                       {/* Content */}
                       <div className="flex-1 min-w-0">
                          <h3 className="text-white font-semibold truncate flex items-center gap-2">
                            {item.title}
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 font-normal">
                              {item.category}
                            </span>
                          </h3>
                          <p className="text-slate-400 text-sm truncate">{item.description}</p>
                       </div>

                       {/* Stats */}
                       <div className="flex flex-col items-end gap-1 min-w-[60px]">
                          <div className="flex items-center gap-1.5 text-orange-400 font-medium text-sm">
                             <Flame className="w-3.5 h-3.5" /> {item.likes}
                          </div>
                          <div className="text-xs text-slate-500">
                             Score: {item.score}
                          </div>
                       </div>
                       
                       <a 
                         href={item.url} 
                         target="_blank" 
                         rel="noopener noreferrer"
                         className="p-2 text-slate-500 hover:text-white opacity-0 group-hover:opacity-100 transition-all"
                       >
                         <ExternalLink className="w-5 h-5" />
                       </a>
                    </div>
                  ))
                )}
             </div>
          )}
        </div>
        
        <div className="text-center pt-4">
           <Link href="/top" className="text-indigo-400 hover:text-indigo-300 text-sm font-medium flex items-center justify-center gap-1">
             View Full Leaderboard <ArrowRight className="w-4 h-4" />
           </Link>
        </div>
      </div>

    </div>
  );
}
