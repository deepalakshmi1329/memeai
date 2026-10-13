import React from 'react';
import { History, Trash2, ArrowRight, Clock, Sparkles } from 'lucide-react';
import { SearchHistoryItem } from '../server/types';

interface HistoryViewProps {
  history: SearchHistoryItem[];
  onSelectScenario: (scenario: string) => void;
  onClearHistory: () => void;
  onDeleteHistoryItem: (id: string) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  history,
  onSelectScenario,
  onClearHistory,
  onDeleteHistoryItem,
}) => {
  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + d.toLocaleDateString();
    } catch {
      return 'Recent';
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h2 className="text-2xl font-bold font-display text-white flex items-center gap-2">
            <History className="w-6 h-6 text-purple-400" />
            Search History ({history.length})
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Past scenario searches and the memes selected for them.
          </p>
        </div>

        {history.length > 0 && (
          <button
            onClick={onClearHistory}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-rose-950/60 text-slate-300 hover:text-rose-300 border border-slate-800 hover:border-rose-900 text-xs font-semibold transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All History</span>
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="p-16 text-center rounded-3xl border border-slate-800 bg-slate-900/30 max-w-xl mx-auto">
          <Clock className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-300 mb-1">No search history yet</h3>
          <p className="text-xs text-slate-400">
            Searches you perform in Meme Finder will appear here so you can re-run them anytime.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-2xl border border-slate-800 bg-slate-900/60 hover:bg-slate-900/90 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                {/* Thumbnail */}
                {item.bestMatch?.mediaUrl ? (
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-black shrink-0 border border-slate-800">
                    <img
                      src={item.bestMatch.mediaUrl}
                      alt={item.scenario}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-purple-950/40 border border-purple-800 flex items-center justify-center shrink-0">
                    <Sparkles className="w-6 h-6 text-purple-400" />
                  </div>
                )}

                <div>
                  <h4 className="font-bold text-sm text-slate-100 mb-1">
                    "{item.scenario}"
                  </h4>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                    <span className="capitalize px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                      {item.humorStyle}
                    </span>
                    <span className="uppercase text-[10px] px-2 py-0.5 rounded-md bg-purple-950 text-purple-300 border border-purple-800/60">
                      {item.bestMatch?.mediaType || 'media'}
                    </span>
                    <span className="text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTime(item.createdAt)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  onClick={() => onSelectScenario(item.scenario)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-200 border border-purple-500/30 text-xs font-semibold transition-colors"
                >
                  <span>Re-search</span>
                  <ArrowRight className="w-3 h-3" />
                </button>

                <button
                  onClick={() => onDeleteHistoryItem(item.id)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                  title="Delete from history"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
