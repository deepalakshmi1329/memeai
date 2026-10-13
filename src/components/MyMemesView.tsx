import React, { useState } from 'react';
import { 
  FolderHeart, 
  Trash2, 
  Heart, 
  Sparkles, 
  Film, 
  Image as ImageIcon, 
  Search,
  ExternalLink,
  Edit3
} from 'lucide-react';
import { MemeItem } from '../server/types';
import { MemeCard } from './MemeCard';

interface MyMemesViewProps {
  memes: MemeItem[];
  onDeleteMeme: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onOpenStudio: (meme: MemeItem) => void;
}

export const MyMemesView: React.FC<MyMemesViewProps> = ({
  memes,
  onDeleteMeme,
  onToggleFavorite,
  onOpenStudio,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'gif' | 'image' | 'generated' | 'favorites'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = memes.filter((m) => {
    if (filterType === 'gif' && m.mediaType !== 'gif') return false;
    if (filterType === 'image' && m.mediaType !== 'image') return false;
    if (filterType === 'generated' && m.resultType !== 'generated') return false;
    if (filterType === 'favorites' && !m.isFavorite) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchScen = (m.scenario || '').toLowerCase().includes(q);
      const matchCap = (m.caption || '').toLowerCase().includes(q);
      return matchScen || matchCap;
    }
    return true;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h2 className="text-2xl font-bold font-display text-white flex items-center gap-2">
            <FolderHeart className="w-6 h-6 text-purple-400" />
            My Saved Memes & Favorites ({memes.length})
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            All your saved internet reaction media and AI-generated creations persisted on disk.
          </p>
        </div>

        {/* Filter Badges */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'all' as const, label: 'All' },
            { id: 'favorites' as const, label: 'Favorites', icon: Heart },
            { id: 'gif' as const, label: 'GIFs', icon: Film },
            { id: 'image' as const, label: 'Images', icon: ImageIcon },
            { id: 'generated' as const, label: 'AI Made', icon: Sparkles },
          ].map((item) => {
            const Icon = item.icon;
            const isSelected = filterType === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setFilterType(item.id)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  isSelected
                    ? 'bg-purple-600/20 border-purple-500 text-purple-200'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-300'
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search Input */}
      {memes.length > 0 && (
        <div className="max-w-md relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search within saved memes..."
            className="w-full rounded-xl bg-slate-900 border border-slate-800 pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:border-purple-500"
          />
        </div>
      )}

      {/* Grid or Empty State */}
      {memes.length === 0 ? (
        <div className="p-16 text-center rounded-3xl border border-slate-800 bg-slate-900/30 max-w-xl mx-auto">
          <FolderHeart className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-300 mb-1">No saved memes yet</h3>
          <p className="text-xs text-slate-400 mb-4">
            Search for any situation in Meme Finder or design one in AI Studio, then click the bookmark icon to save it here.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center text-slate-500 rounded-2xl border border-slate-800 bg-slate-900/40">
          <p className="text-sm">No memes match your search or filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((meme) => (
            <div key={meme.id} className="relative group">
              <MemeCard
                meme={meme}
                isSaved={true}
                onToggleFavorite={onToggleFavorite}
                onOpenStudio={onOpenStudio}
              />
              <button
                onClick={() => onDeleteMeme(meme.id)}
                className="mt-2 w-full py-1.5 px-3 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-900/50 text-xs font-semibold text-rose-300 hover:text-rose-100 transition-colors flex items-center justify-center gap-1.5"
                title="Remove from saved collection"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove from Saved</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
