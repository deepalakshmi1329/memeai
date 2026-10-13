import React, { useState, useEffect } from 'react';
import { Flame, Film, Image as ImageIcon, Sparkles, Filter, ExternalLink } from 'lucide-react';
import { MemeItem } from '../server/types';
import { MemeCard } from './MemeCard';

interface ExploreViewProps {
  onSelectForFinder: (scenario: string) => void;
  onOpenStudio: (meme: MemeItem) => void;
  onSaveMeme: (meme: MemeItem) => void;
  savedMemeIds: Set<string>;
  onToggleFavorite: (id: string) => void;
}

export const ExploreView: React.FC<ExploreViewProps> = ({
  onSelectForFinder,
  onOpenStudio,
  onSaveMeme,
  savedMemeIds,
  onToggleFavorite,
}) => {
  const [memes, setMemes] = useState<MemeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'gif' | 'image'>('all');
  const [searchFilter, setSearchFilter] = useState('');

  useEffect(() => {
    fetchTrending();
  }, []);

  const fetchTrending = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/meme/trending');
      const data = await res.json();
      if (data.trending && Array.isArray(data.trending)) {
        setMemes(data.trending);
      }
    } catch (err) {
      console.warn('Failed to load trending', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredMemes = memes.filter((m) => {
    if (filterType === 'gif' && m.mediaType !== 'gif') return false;
    if (filterType === 'image' && m.mediaType !== 'image') return false;
    if (searchFilter.trim()) {
      const term = searchFilter.toLowerCase();
      const matchCaption = (m.caption || '').toLowerCase().includes(term);
      const matchTags = (m.tags || []).some((t) => t.toLowerCase().includes(term));
      return matchCaption || matchTags;
    }
    return true;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h2 className="text-2xl font-bold font-display text-white flex items-center gap-2">
            <Flame className="w-6 h-6 text-amber-400" />
            Explore Trending Memes & Reaction GIFs
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Browse the internet's most iconic reaction media. Pick any meme to adapt it with your own situation.
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
              filterType === 'all'
                ? 'bg-purple-600/20 border-purple-500 text-purple-200'
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
          >
            All Media
          </button>
          <button
            onClick={() => setFilterType('gif')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors flex items-center gap-1 ${
              filterType === 'gif'
                ? 'bg-cyan-600/20 border-cyan-500 text-cyan-200'
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            GIFs
          </button>
          <button
            onClick={() => setFilterType('image')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors flex items-center gap-1 ${
              filterType === 'image'
                ? 'bg-amber-600/20 border-amber-500 text-amber-200'
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            Images
          </button>
        </div>
      </div>

      {/* Search Filter Input */}
      <div className="max-w-md">
        <input
          type="text"
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          placeholder="Filter by emotion or tag (e.g. panic, exam, cat, awkward)..."
          className="w-full rounded-xl bg-slate-900 border border-slate-800 p-2.5 text-xs text-white placeholder-slate-500 focus:border-purple-500"
        />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400">
          <Sparkles className="w-8 h-8 text-purple-400 animate-spin mx-auto mb-2" />
          <p className="text-sm font-semibold">Loading trending reaction media...</p>
        </div>
      ) : filteredMemes.length === 0 ? (
        <div className="p-12 text-center text-slate-500 rounded-2xl border border-slate-800 bg-slate-900/40">
          <p className="text-sm">No memes matched your tag filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredMemes.map((meme) => (
            <div key={meme.id} className="flex flex-col justify-between">
              <MemeCard
                meme={meme}
                isSaved={savedMemeIds.has(meme.id)}
                onSave={onSaveMeme}
                onToggleFavorite={onToggleFavorite}
                onOpenStudio={onOpenStudio}
              />
              <button
                onClick={() => onSelectForFinder(meme.caption || 'When this happens...')}
                className="mt-2 py-1.5 px-3 rounded-xl bg-slate-900 hover:bg-purple-900/40 border border-slate-800 hover:border-purple-500/40 text-xs font-semibold text-slate-300 hover:text-purple-200 transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Find Match for This</span>
                <Sparkles className="w-3 h-3 text-purple-400" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
