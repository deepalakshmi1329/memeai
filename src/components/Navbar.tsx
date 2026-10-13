import React from 'react';
import { 
  Sparkles, 
  Flame, 
  Palette, 
  FolderHeart, 
  History, 
  Settings, 
  Bot
} from 'lucide-react';

export type TabType = 'finder' | 'explore' | 'studio' | 'saved' | 'history' | 'settings';

interface NavbarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  savedCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, savedCount }) => {
  const navItems = [
    { id: 'finder' as TabType, label: 'Meme Finder', icon: Sparkles },
    { id: 'explore' as TabType, label: 'Explore & Hot', icon: Flame },
    { id: 'studio' as TabType, label: 'AI Meme Studio', icon: Palette },
    { id: 'saved' as TabType, label: 'My Memes', icon: FolderHeart, badge: savedCount > 0 ? savedCount : null },
    { id: 'history' as TabType, label: 'History', icon: History },
    { id: 'settings' as TabType, label: 'Setup & Keys', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <button 
            onClick={() => setActiveTab('finder')}
            className="flex items-center gap-3 group text-left transition-transform active:scale-95"
          >
            <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-purple-500/40 bg-purple-950/40 flex items-center justify-center shadow-lg shadow-purple-500/10">
              <img 
                src="/src/assets/images/mememind_mascot_1791883658309.jpg" 
                alt="MemeMind AI" 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-extrabold text-lg tracking-tight bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300 bg-clip-text text-transparent">
                  MemeMind AI
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Gemini 3.8
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                Intelligent Meme & GIF Finder
              </p>
            </div>
          </button>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-purple-600/15 text-purple-300 border border-purple-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80 border border-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-purple-400' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                  {item.badge !== null && item.badge !== undefined && (
                    <span className="ml-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-purple-500 text-white leading-none">
                      {item.badge}
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Quick AI status pill */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('settings')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 transition-colors"
              title="System Diagnostics & Settings"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <Bot className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden sm:inline">Engine Active</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile navigation row */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-900 bg-slate-950/95 py-2 px-2 overflow-x-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium ${
                isActive ? 'text-purple-400 bg-purple-500/10' : 'text-slate-400'
              }`}
            >
              <div className="relative">
                <Icon className="w-4 h-4" />
                {item.badge !== null && item.badge !== undefined && (
                  <span className="absolute -top-1 -right-2 text-[9px] font-bold px-1 rounded-full bg-purple-500 text-white">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] whitespace-nowrap">{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
