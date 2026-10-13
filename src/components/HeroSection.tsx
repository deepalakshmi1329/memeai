import React from 'react';
import { Sparkles, Film, Image as ImageIcon, Cpu, Zap } from 'lucide-react';

interface HeroSectionProps {
  onSelectScenario: (scenario: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onSelectScenario }) => {
  const quickScenarios = [
    'When I study all night but forget everything in the exam',
    'Pushing untested code straight to production on Friday at 5 PM',
    'Opening my bank account after saying "treat yourself" all week',
    'That awkward moment when someone waves and you wave back but it wasn\'t for you',
    'When the meeting could have been a 2-line Slack message',
  ];

  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-800/80 bg-gradient-to-b from-purple-950/20 via-slate-900/40 to-slate-950 p-6 sm:p-8 mb-8">
      {/* Background Hero Image with soft gradient masks */}
      <div className="absolute inset-0 -z-10 opacity-25 overflow-hidden">
        <img
          src="/src/assets/images/mememind_hero_1791883658071.jpg"
          alt="MemeMind AI Banner"
          className="w-full h-full object-cover filter blur-[1px] scale-105"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-transparent to-slate-950" />
      </div>

      <div className="max-w-3xl">
        {/* Top Badges */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/30">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            AI-Powered Humor Search
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
            <Film className="w-3.5 h-3.5 text-cyan-400" />
            Real Animated GIFs
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
            Iconic Meme Templates
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            <Cpu className="w-3.5 h-3.5 text-emerald-400" />
            Gemini 3.8 Reasoning
          </span>
        </div>

        {/* Heading */}
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-3 font-display">
          Turn any situation into{' '}
          <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300 bg-clip-text text-transparent">
            a hilarious meme.
          </span>
        </h1>
        <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6 max-w-2xl">
          Describe what happened in everyday words. MemeMind AI comprehends the irony, searches the real internet for both animated reaction GIFs and iconic meme templates, picks the funniest match, or creates an original AI meme on demand.
        </p>

        {/* Quick prompt chips */}
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            Try these relatable scenarios:
          </div>
          <div className="flex flex-wrap gap-2">
            {quickScenarios.map((scen, idx) => (
              <button
                key={idx}
                onClick={() => onSelectScenario(scen)}
                className="text-xs text-slate-300 bg-slate-900/90 hover:bg-purple-900/40 hover:text-purple-200 border border-slate-800 hover:border-purple-500/40 px-3 py-1.5 rounded-lg transition-all text-left truncate max-w-xs sm:max-w-md shadow-sm"
              >
                "{scen}"
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
