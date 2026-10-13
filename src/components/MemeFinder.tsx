import React, { useState } from 'react';
import { 
  Sparkles, 
  Search, 
  Dices, 
  Film, 
  Image as ImageIcon, 
  Cpu, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  Layers,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { MemeItem, SearchResponse, HumorStyle } from '../server/types';
import { MemeCard } from './MemeCard';

interface MemeFinderProps {
  initialScenario?: string;
  onSaveMeme: (meme: MemeItem) => void;
  savedMemeIds: Set<string>;
  onToggleFavorite: (id: string) => void;
  onOpenStudio: (meme: MemeItem) => void;
}

const SURPRISE_SCENARIOS = [
  'When I study all night but forget everything in the exam',
  'Pushing code straight to production on Friday at 5 PM',
  'When you wave back at someone who was waving at the person behind you',
  'Opening your bank app after saying "I deserve a little treat"',
  'When the meeting could have been a 2-sentence Slack message',
  'Telling myself just one more episode at 2 AM',
  'My code worked on the first try and now I am deeply suspicious',
  'When the group project leader assigns all the work to you',
  'Looking at a recipe: "Prep time: 10 mins" — 2 hours later in chaos',
  'When your favorite song starts playing right as you park the car',
  'Saying "you too" after the airport security guard says "have a safe flight"',
  'When you fix one bug in your program and 47 new bugs appear',
];

const HUMOR_STYLES: Array<{ id: HumorStyle; label: string; emoji: string }> = [
  { id: 'relatable', label: 'Relatable', emoji: '🤝' },
  { id: 'sarcastic', label: 'Sarcastic', emoji: '😏' },
  { id: 'student', label: 'Student Life', emoji: '📚' },
  { id: 'exam_panic', label: 'Exam Panic', emoji: '😱' },
  { id: 'workplace', label: 'Workplace', emoji: '💼' },
  { id: 'gaming', label: 'Gaming', emoji: '🎮' },
  { id: 'friendship', label: 'Friendship', emoji: '👯' },
  { id: 'wholesome', label: 'Wholesome', emoji: '💖' },
  { id: 'chaotic', label: 'Chaotic Reactions', emoji: '🌪️' },
  { id: 'dark_safe', label: 'Dark-but-Safe', emoji: '💀' },
];

export const MemeFinder: React.FC<MemeFinderProps> = ({
  initialScenario = '',
  onSaveMeme,
  savedMemeIds,
  onToggleFavorite,
  onOpenStudio,
}) => {
  const [scenario, setScenario] = useState(initialScenario);
  const [humorStyle, setHumorStyle] = useState<HumorStyle>('relatable');
  const [formatPreference, setFormatPreference] = useState<'all' | 'gif' | 'image' | 'ai'>('all');
  
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [searchResult, setSearchResult] = useState<SearchResponse | null>(null);

  // Quick surprise me
  const handleSurpriseMe = () => {
    const random = SURPRISE_SCENARIOS[Math.floor(Math.random() * SURPRISE_SCENARIOS.length)];
    setScenario(random);
    setError(null);
  };

  // Perform search with simulated honest step updates
  const executeSearch = async (overrideFormat?: 'all' | 'gif' | 'image' | 'ai') => {
    const textToSearch = scenario.trim();
    if (!textToSearch) {
      setError('Please type a scenario first or click Surprise Me!');
      return;
    }

    setLoading(true);
    setError(null);
    const chosenFormat = overrideFormat || formatPreference;

    try {
      setLoadingStep('1/4 Analyzing humor mechanism & context with Gemini...');
      
      const stepTimer1 = setTimeout(() => {
        setLoadingStep('2/4 Searching GIPHY, Tenor & meme archives for reaction matches...');
      }, 700);

      const stepTimer2 = setTimeout(() => {
        setLoadingStep('3/4 Evaluating comedic timing & ranking relevance...');
      }, 1500);

      const res = await fetch('/api/meme/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenario: textToSearch,
          humorStyle,
          formatPreference: chosenFormat,
        }),
      });

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with status ${res.status}`);
      }

      setLoadingStep('4/4 Selecting best match and formatting alternatives...');
      const data: SearchResponse = await res.json();
      setSearchResult(data);
    } catch (err: any) {
      console.error('Search error:', err);
      setError(err?.message || 'Failed to search memes. Please check connection and try again.');
    } finally {
      setLoading(false);
      setLoadingStep('');
    }
  };

  // Swap an alternative into the main slot
  const handlePromoteAlternative = (altMeme: MemeItem) => {
    if (!searchResult) return;
    const oldBest = searchResult.bestMatch;
    const updatedAlternatives = searchResult.alternatives.filter((a) => a.id !== altMeme.id);
    updatedAlternatives.unshift(oldBest);

    setSearchResult({
      ...searchResult,
      bestMatch: altMeme,
      alternatives: updatedAlternatives,
    });
  };

  return (
    <div className="space-y-8">
      {/* Search Input Box */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 sm:p-7 shadow-xl relative overflow-hidden">
        {/* Glow backdrop accent */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full filter blur-3xl pointer-events-none -z-10" />

        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="scenarioInput" className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Search className="w-4 h-4 text-purple-400" />
                Describe your situation or emotion:
              </label>
              <span className="text-xs text-slate-400">
                {scenario.length} / 250 characters
              </span>
            </div>

            <div className="relative">
              <textarea
                id="scenarioInput"
                value={scenario}
                onChange={(e) => setScenario(e.target.value.slice(0, 250))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    executeSearch();
                  }
                }}
                placeholder="e.g. When I study all night but forget everything the second I read question 1 in the exam..."
                rows={3}
                className="w-full rounded-2xl bg-slate-950/90 border border-slate-800 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-slate-100 placeholder-slate-500 p-4 text-sm sm:text-base leading-relaxed transition-all resize-none shadow-inner"
              />
              {scenario && (
                <button
                  onClick={() => setScenario('')}
                  className="absolute top-3 right-3 text-xs text-slate-400 hover:text-slate-200 bg-slate-800/80 px-2 py-1 rounded-md"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Controls: Format Filter & Humor Style */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {/* Format preference */}
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                Format Preference:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'all' as const, label: 'All (Smart)', icon: Sparkles },
                  { id: 'gif' as const, label: 'GIFs Only', icon: Film },
                  { id: 'image' as const, label: 'Images Only', icon: ImageIcon },
                  { id: 'ai' as const, label: 'AI Generate', icon: Cpu },
                ].map((fmt) => {
                  const Icon = fmt.icon;
                  const isSelected = formatPreference === fmt.id;
                  return (
                    <button
                      key={fmt.id}
                      onClick={() => setFormatPreference(fmt.id)}
                      className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-semibold transition-all border ${
                        isSelected
                          ? 'bg-purple-600/25 border-purple-500 text-purple-200 shadow-sm'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-purple-400' : 'text-slate-500'}`} />
                      <span>{fmt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Humor Style Selector */}
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                Humor Archetype:
              </span>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                {HUMOR_STYLES.map((style) => {
                  const isSelected = humorStyle === style.id;
                  return (
                    <button
                      key={style.id}
                      onClick={() => setHumorStyle(style.id)}
                      className={`shrink-0 flex items-center gap-1 py-1.5 px-2.5 rounded-xl text-xs font-medium transition-all border ${
                        isSelected
                          ? 'bg-pink-600/20 border-pink-500/60 text-pink-200'
                          : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:text-slate-300'
                      }`}
                    >
                      <span>{style.emoji}</span>
                      <span>{style.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Main Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-800/80">
            <button
              onClick={() => executeSearch()}
              disabled={loading || !scenario.trim()}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-500 hover:via-pink-500 hover:to-purple-500 disabled:opacity-50 text-white font-bold text-sm sm:text-base shadow-lg shadow-purple-600/25 transition-all transform active:scale-95 cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Finding Your Meme...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Find My Meme</span>
                </>
              )}
            </button>

            <button
              onClick={handleSurpriseMe}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-700 transition-colors cursor-pointer"
            >
              <Dices className="w-4 h-4 text-amber-400" />
              <span>Surprise Me</span>
            </button>

            <button
              onClick={() => executeSearch('ai')}
              disabled={loading || !scenario.trim()}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-purple-950/40 hover:bg-purple-900/40 text-purple-300 border border-purple-800/60 font-semibold text-sm transition-colors cursor-pointer"
              title="Generate a brand new AI meme image"
            >
              <Cpu className="w-4 h-4" />
              <span>Generate AI Meme</span>
            </button>
          </div>
        </div>
      </div>

      {/* Real-time Progress & Loading Indicator */}
      {loading && (
        <div className="p-6 rounded-2xl border border-purple-500/30 bg-purple-950/20 backdrop-blur-md animate-pulse">
          <div className="flex items-center gap-3 mb-3">
            <RefreshCw className="w-5 h-5 text-purple-400 animate-spin" />
            <span className="font-bold text-sm text-purple-200">
              MemeMind AI at work...
            </span>
          </div>
          <p className="text-xs sm:text-sm text-purple-300/80 mb-2 font-mono">
            {loadingStep}
          </p>
          <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-purple-500/20">
            <div className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-400 rounded-full animate-indeterminate" />
          </div>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-2xl border border-rose-500/40 bg-rose-950/30 text-rose-200 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold mb-1">Search encountered an issue</p>
            <p className="text-xs text-rose-300/90">{error}</p>
          </div>
          <button
            onClick={() => executeSearch()}
            className="px-3 py-1 rounded-lg bg-rose-900/60 hover:bg-rose-900 text-xs font-semibold text-rose-200 border border-rose-700/60"
          >
            Retry
          </button>
        </div>
      )}

      {/* Results View */}
      {searchResult && !loading && (
        <div className="space-y-8 animate-fadeIn">
          {/* Analysis Breakdown Header */}
          <div className="p-4 sm:p-5 rounded-2xl border border-slate-800 bg-slate-900/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
                  AI Context Analysis:
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300">
                  {searchResult.analysis.emotion}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                <strong className="text-slate-200">Humor Core:</strong> {searchResult.analysis.humorCore}
              </p>
              <p className="text-xs text-slate-400">
                <strong className="text-slate-300">Format Choice:</strong> {searchResult.analysis.formatRationale}
              </p>
            </div>

            <div className="flex items-center gap-2 self-end md:self-center">
              <button
                onClick={() => executeSearch()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Search Again</span>
              </button>

              <button
                onClick={() => executeSearch('ai')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/40 text-xs font-semibold text-purple-200 border border-purple-500/40 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>Generate Anyway</span>
              </button>
            </div>
          </div>

          {/* Main Best Match Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-bold font-display text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                #1 Best Match for Your Situation
              </h2>
            </div>

            <MemeCard
              meme={searchResult.bestMatch}
              isMainHero={true}
              isSaved={savedMemeIds.has(searchResult.bestMatch.id)}
              onSave={onSaveMeme}
              onToggleFavorite={onToggleFavorite}
              onOpenStudio={onOpenStudio}
            />
          </div>

          {/* Alternative Matches Section */}
          {searchResult.alternatives && searchResult.alternatives.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold font-display text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-purple-400" />
                    Alternative Comedic Reactions ({searchResult.alternatives.length})
                  </h3>
                  <p className="text-xs text-slate-400">
                    Click any alternative below to make it your primary meme
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {searchResult.alternatives.map((alt) => (
                  <div key={alt.id} className="relative group">
                    <MemeCard
                      meme={alt}
                      isSaved={savedMemeIds.has(alt.id)}
                      onSave={onSaveMeme}
                      onToggleFavorite={onToggleFavorite}
                      onOpenStudio={onOpenStudio}
                    />
                    <button
                      onClick={() => handlePromoteAlternative(alt)}
                      className="mt-2 w-full py-1.5 px-3 rounded-xl bg-slate-800/80 hover:bg-purple-600/30 border border-slate-700/80 hover:border-purple-500/40 text-xs font-semibold text-slate-300 hover:text-purple-200 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span>Choose as Main Match</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
