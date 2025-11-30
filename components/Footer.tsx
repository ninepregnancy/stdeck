
import React from 'react';
import { Logo } from './Logo';

export const Footer = () => {
  return (
    <footer className="border-t border-slate-800 bg-slate-900/50 mt-12">
      <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <Logo className="scale-90 opacity-80" />
        <p className="text-slate-500 text-sm">
          © {new Date().getFullYear()} StartupDeck. All rights reserved.
        </p>
        <div className="flex gap-6 text-sm text-slate-500">
           <a href="#" className="hover:text-slate-300">Privacy</a>
           <a href="#" className="hover:text-slate-300">Terms</a>
           <a href="#" className="hover:text-slate-300">Twitter</a>
        </div>
      </div>
    </footer>
  );
};
