
import React from 'react';
import { Layers } from 'lucide-react';
import { cn } from '../lib/utils';

export const Logo: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn("flex items-center gap-2 select-none", className)}>
      <div className="bg-indigo-600 p-1.5 rounded-lg shadow-lg shadow-indigo-500/20">
        <Layers className="w-5 h-5 text-white" />
      </div>
      <span className="font-bold text-xl tracking-tight text-white">StartupDeck</span>
    </div>
  );
};
