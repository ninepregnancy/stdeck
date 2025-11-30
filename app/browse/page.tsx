'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../../services/db-client';
import { getSessionId } from '../../lib/utils';
import { Startup } from '../../types';
import { StartupCard } from '../../components/StartupCard';
import { Button } from '../../components/Button';
import { RefreshCw, Loader2, ExternalLink, ArrowRight, Heart, Sparkles } from 'lucide-react';

export default function BrowsePage() {
  const [currentStartup, setCurrentStartup] = useState<Startup | null>(null);
  const [loading, setLoading] = useState(true);
  const [finished, setFinished] = useState(false);
  const [likedStartup, setLikedStartup] = useState<Startup | null>(null);
  const [sessionId, setSessionId] = useState<string>('');

  useEffect(() => {
    // Only access localStorage on the client
    setSessionId(getSessionId());
  }, []);

  const fetchNext = useCallback(async () => {
    if (!sessionId) return;
    
    setLikedStartup(null);
    setLoading(true);
    try {
      const next = await api.getRandomStartup(sessionId);
      if (next) {
        setCurrentStartup(next);
      } else {
        setFinished(true);
        setCurrentStartup(null);
      }
    } catch (e) {
      console.error(e);
      // If error (e.g. 404 or network), assume finished or retry
      setFinished(true);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    if (sessionId) {
      fetchNext();
    }
  }, [fetchNext, sessionId]);

  const handleLike = async () => {
    if (!currentStartup) return;
    try {
        await api.vote(sessionId, currentStartup.id, 'like');
        setLikedStartup(currentStartup); 
        setCurrentStartup(null);
    } catch (e) {
        console.error("Like failed", e);
        fetchNext();
    }
  };

  const handleSkip = async () => {
    if (!currentStartup) return;
    try {
        await api.vote(sessionId, currentStartup.id, 'skip');
        fetchNext();
    } catch (e) {
        console.error("Skip failed", e);
        fetchNext();
    }
  };

  const handleVisit = async (startup: Startup) => {
    try {
        await api.visit(sessionId, startup.id);
        window.open(startup.url, '_blank');
    } catch (e) {
        console.error("Visit failed", e);
    }
  };

  if (likedStartup) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] w-full max-w-md mx-auto animate-in zoom-in duration-300 px-4">
        <div className="relative mb-8">
           <div className="absolute inset-0 bg-green-500/20 blur-xl rounded-full" />
           <div className="relative bg-gradient-to-br from-green-500 to-emerald-600 p-6 rounded-full shadow-2xl shadow-green-500/30">
             <Heart className="w-16 h-16 text-white fill-white animate-bounce" />
           </div>
           <div className="absolute -top-2 -right-2">
             <Sparkles className="w-8 h-8 text-yellow-300 animate-pulse" />
           </div>
        </div>
        <h2 className="text-3xl font-bold text-white mb-2 text-center">It's a Match!</h2>
        <p className="text-slate-400 text-center mb-8 max-w-xs">
          You liked <span className="text-indigo-400 font-semibold">{likedStartup.title}</span>. 
          <br/>Go check them out or keep swiping.
        </p>
        <div className="flex flex-col gap-3 w-full">
          <Button 
            variant="primary" 
            size="lg" 
            onClick={() => handleVisit(likedStartup)}
            className="w-full gap-2 shadow-xl shadow-indigo-500/20 py-4 text-lg"
          >
            <ExternalLink className="w-5 h-5" /> Visit Website
          </Button>
          <Button 
            variant="ghost" 
            size="lg" 
            onClick={fetchNext}
            className="w-full gap-2 text-slate-400 hover:text-white"
          >
             Keep Swiping <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </div>
    );
  }

  if (loading || !sessionId) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <div className="relative">
           <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full" />
           <Loader2 className="relative w-12 h-12 text-indigo-500 animate-spin" />
        </div>
        <p className="text-slate-400 mt-6 font-medium animate-pulse">Finding hidden gems...</p>
      </div>
    );
  }

  if (finished) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center space-y-6 animate-in fade-in duration-500">
        <div className="bg-slate-800 p-6 rounded-full border border-slate-700">
          <RefreshCw className="w-12 h-12 text-indigo-400" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">All caught up!</h2>
          <p className="text-slate-400 max-w-xs mx-auto">
            You've seen all the startups for now. Check the leaderboard to see who's winning.
          </p>
        </div>
        <Button onClick={() => window.location.reload()} variant="outline">
          Refresh Feed
        </Button>
      </div>
    );
  }

  if (currentStartup) {
    return (
      <div className="flex flex-col items-center justify-center py-4">
        <StartupCard
          startup={currentStartup}
          onLike={handleLike}
          onSkip={handleSkip}
          onVisit={() => handleVisit(currentStartup)}
        />
      </div>
    );
  }

  return null;
}