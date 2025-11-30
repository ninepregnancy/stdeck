
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '../components/Logo';
import { Footer } from '../components/Footer';
import { Flame, PlusCircle, LayoutGrid, Layers } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: LayoutProps) {
  const pathname = usePathname();

  const navItems = [
    { path: '/', icon: LayoutGrid, label: 'Home' },
    { path: '/browse', icon: Layers, label: 'Browse' },
    { path: '/top', icon: Flame, label: 'Top' },
    { path: '/add', icon: PlusCircle, label: 'Add' },
  ];

  return (
    <html lang="en">
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <style>{`
          body { font-family: 'Inter', sans-serif; background-color: #0f172a; color: #f8fafc; }
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>
      </head>
      <body className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
        {/* Header - Desktop & Mobile Top */}
        <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800">
          <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/" className="group">
               <Logo />
            </Link>
            
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link 
                  key={item.path} 
                  href={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    pathname === item.path 
                      ? 'bg-indigo-500/10 text-indigo-400' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8 pb-24 md:pb-12 animate-in fade-in duration-500">
          {children}
        </main>

        {/* Footer */}
        <Footer />

        {/* Mobile Bottom Nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur border-t border-slate-800 pb-safe z-50">
          <div className="flex justify-around items-center h-16">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;
              return (
                <Link 
                  key={item.path} 
                  href={item.path}
                  className={`flex flex-col items-center justify-center w-full h-full space-y-1 active:scale-95 transition-transform ${
                    isActive ? 'text-indigo-400' : 'text-slate-500'
                  }`}
                >
                  <div className={`p-1 rounded-full ${isActive ? 'bg-indigo-500/20' : ''}`}>
                      <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                  </div>
                  <span className="text-[10px] font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </body>
    </html>
  );
}
