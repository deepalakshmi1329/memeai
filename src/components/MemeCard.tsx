import React, { useState } from 'react';
import { 
  Heart, 
  Bookmark, 
  Download, 
  Share2, 
  ExternalLink, 
  ThumbsUp, 
  ThumbsDown, 
  Check, 
  Sparkles, 
  Film, 
  Image as ImageIcon,
  Edit3,
  Flame,
  Info
} from 'lucide-react';
import { MemeItem } from '../server/types';

interface MemeCardProps {
  meme: MemeItem;
  isSaved?: boolean;
  onSave?: (meme: MemeItem) => void;
  onDelete?: (id: string) => void;
  onToggleFavorite?: (id: string) => void;
  onOpenStudio?: (meme: MemeItem) => void;
  isMainHero?: boolean;
}

export const MemeCard: React.FC<MemeCardProps> = ({
  meme,
  isSaved = false,
  onSave,
  onDelete,
  onToggleFavorite,
  onOpenStudio,
  isMainHero = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [userRating, setUserRating] = useState<'up' | 'down' | null>(
    meme.userRating?.isPositive === true ? 'up' : meme.userRating?.isPositive === false ? 'down' : null
  );
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);

  const handleShare = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(meme.mediaUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (e) {
      console.warn('Copy failed', e);
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch(meme.mediaUrl, { mode: 'cors' });
      const blob = await response.blob();
      const ext = meme.mediaType === 'gif' ? 'gif' : 'jpg';
      const fileName = `mememind_${meme.provider}_${Date.now()}.${ext}`;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      // Direct anchor link fallback
      const a = document.createElement('a');
      a.href = meme.mediaUrl;
      a.target = '_blank';
      a.download = `meme_${Date.now()}.${meme.mediaType === 'gif' ? 'gif' : 'jpg'}`;
      a.click();
    } finally {
      setIsDownloading(false);
    }
  };

  const handleRate = async (type: 'up' | 'down') => {
    setUserRating(type);
    try {
      await fetch('/api/meme/rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memeId: meme.id,
          scenario: meme.scenario || 'General meme',
          isPositive: type === 'up',
          rating: type === 'up' ? 5 : 2,
          feedback: feedbackText || (type === 'up' ? 'Accurate & funny' : 'Not quite matching'),
        }),
      });
    } catch (err) {
      console.warn('Failed to submit rating', err);
    }
  };

  // Determine Result Type Badge
  const getResultTypeBadge = () => {
    if (meme.resultType === 'generated') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border border-purple-500/40">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          AI-Generated — Image
        </span>
      );
    }
    if (meme.mediaType === 'gif') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm">
          <Film className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          Found Online — GIF
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
        <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
        Found Online — Image
      </span>
    );
  };

  return (
    <div
      className={`group relative rounded-2xl border transition-all duration-300 flex flex-col justify-between overflow-hidden ${
        isMainHero
          ? 'border-purple-500/50 bg-gradient-to-b from-slate-900/90 to-slate-950 p-4 sm:p-6 shadow-2xl shadow-purple-950/40'
          : 'border-slate-800 bg-slate-900/60 hover:bg-slate-900/90 hover:border-slate-700 p-3.5 shadow-lg'
      }`}
    >
      <div>
        {/* Top Header Row with Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            {getResultTypeBadge()}
            {meme.relevanceScore !== undefined && (
              <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-md">
                {meme.relevanceScore}% Match
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {onToggleFavorite && (
              <button
                onClick={() => onToggleFavorite(meme.id)}
                className={`p-1.5 rounded-lg border transition-colors ${
                  meme.isFavorite
                    ? 'bg-rose-500/20 border-rose-500/50 text-rose-400'
                    : 'bg-slate-800/80 border-slate-700/60 text-slate-400 hover:text-rose-400'
                }`}
                title="Favorite"
              >
                <Heart className={`w-4 h-4 ${meme.isFavorite ? 'fill-rose-500' : ''}`} />
              </button>
            )}

            {onSave && (
              <button
                onClick={() => onSave(meme)}
                className={`p-1.5 rounded-lg border transition-colors ${
                  isSaved
                    ? 'bg-purple-500/20 border-purple-500/50 text-purple-300'
                    : 'bg-slate-800/80 border-slate-700/60 text-slate-400 hover:text-purple-300'
                }`}
                title={isSaved ? 'Saved to collection' : 'Save Meme'}
              >
                <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-purple-400' : ''}`} />
              </button>
            )}
          </div>
        </div>

        {/* Media Preview Container */}
        <div
          className={`relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800/80 flex items-center justify-center mb-3 ${
            isMainHero ? 'min-h-[280px] max-h-[460px]' : 'min-h-[190px] max-h-[250px]'
          }`}
        >
          <img
            src={meme.mediaUrl}
            alt={meme.caption || meme.scenario || 'Meme Preview'}
            className="w-full h-full object-contain max-h-[460px] rounded-lg"
            loading="lazy"
            referrerPolicy="no-referrer"
          />

          {/* Quick GIF live indicator */}
          {meme.mediaType === 'gif' && (
            <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-black/75 backdrop-blur-sm text-cyan-300 border border-cyan-500/40">
              GIF
            </span>
          )}
        </div>

        {/* Caption & Scenario Text */}
        <div className="space-y-1.5 mb-3">
          {meme.caption && (
            <p className="font-display font-bold text-sm sm:text-base text-slate-100 leading-snug">
              "{meme.caption}"
            </p>
          )}

          {meme.scenario && (
            <p className="text-xs text-slate-400 line-clamp-2">
              <span className="text-slate-500 font-medium">Scenario:</span> {meme.scenario}
            </p>
          )}

          {/* AI Rationale / Why Chosen */}
          {meme.reasoning && (
            <div className="mt-2 p-2.5 rounded-xl bg-purple-950/25 border border-purple-900/40 text-xs text-purple-200/90 leading-relaxed flex items-start gap-2">
              <Info className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
              <span>
                <strong className="text-purple-300 font-semibold">Humor Match:</strong> {meme.reasoning}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions & Metadata */}
      <div className="border-t border-slate-800/80 pt-3 mt-2 flex flex-col gap-2.5">
        <div className="flex items-center justify-between text-xs text-slate-400">
          {/* Source Attribution */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
              Source:
            </span>
            {meme.sourceUrl ? (
              <a
                href={meme.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-slate-300 hover:text-purple-400 transition-colors font-medium capitalize"
              >
                {meme.provider}
                <ExternalLink className="w-3 h-3" />
              </a>
            ) : (
              <span className="capitalize font-medium text-slate-300">{meme.provider}</span>
            )}
          </div>

          {/* Rating Buttons */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] text-slate-500 mr-1 hidden sm:inline">Rate match:</span>
            <button
              onClick={() => handleRate('up')}
              className={`p-1 rounded transition-colors ${
                userRating === 'up'
                  ? 'text-emerald-400 bg-emerald-950/50'
                  : 'text-slate-500 hover:text-emerald-400'
              }`}
              title="Funny & accurate"
            >
              <ThumbsUp className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleRate('down')}
              className={`p-1 rounded transition-colors ${
                userRating === 'down'
                  ? 'text-rose-400 bg-rose-950/50'
                  : 'text-slate-500 hover:text-rose-400'
              }`}
              title="Missed the joke"
            >
              <ThumbsDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="flex items-center gap-2">
          {onOpenStudio && (
            <button
              onClick={() => onOpenStudio(meme)}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300 hover:text-purple-200 text-xs font-semibold transition-all"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Customize in Studio</span>
            </button>
          )}

          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
            title="Download Media File"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Download</span>
          </button>

          <button
            onClick={handleShare}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            title="Copy URL"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
};
