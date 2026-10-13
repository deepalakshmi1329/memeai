import React, { useState, useEffect } from 'react';
import { Navbar, TabType } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { MemeFinder } from './components/MemeFinder';
import { ExploreView } from './components/ExploreView';
import { MemeStudio } from './components/MemeStudio';
import { MyMemesView } from './components/MyMemesView';
import { HistoryView } from './components/HistoryView';
import { SettingsView } from './components/SettingsView';
import { MemeItem, SearchHistoryItem } from './server/types';
import { Sparkles, Heart, Check, Bot } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('finder');
  const [savedMemes, setSavedMemes] = useState<MemeItem[]>([]);
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [selectedStudioMeme, setSelectedStudioMeme] = useState<MemeItem | null>(null);
  const [finderScenario, setFinderScenario] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Fetch saved memes & history on mount
  useEffect(() => {
    fetchSavedMemes();
    fetchHistory();
  }, []);

  const fetchSavedMemes = async () => {
    try {
      const res = await fetch('/api/meme/saved');
      const data = await res.json();
      if (data.memes && Array.isArray(data.memes)) {
        setSavedMemes(data.memes);
      }
    } catch (err) {
      console.warn('Failed to load saved memes', err);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/meme/history');
      const data = await res.json();
      if (data.history && Array.isArray(data.history)) {
        setHistory(data.history);
      }
    } catch (err) {
      console.warn('Failed to load history', err);
    }
  };

  // Save Meme
  const handleSaveMeme = async (meme: MemeItem) => {
    try {
      const res = await fetch('/api/meme/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(meme),
      });
      const saved = await res.json();
      setSavedMemes((prev) => {
        const idx = prev.findIndex((m) => m.id === saved.id);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = saved;
          return updated;
        }
        return [saved, ...prev];
      });
      showToast('Saved to My Memes! 📁');
    } catch (err) {
      console.warn('Failed to save meme', err);
    }
  };

  // Delete Meme
  const handleDeleteMeme = async (id: string) => {
    try {
      await fetch(`/api/meme/saved/${id}`, { method: 'DELETE' });
      setSavedMemes((prev) => prev.filter((m) => m.id !== id));
      showToast('Removed from saved memes');
    } catch (err) {
      console.warn('Failed to delete meme', err);
    }
  };

  // Toggle Favorite
  const handleToggleFavorite = async (id: string) => {
    try {
      const res = await fetch(`/api/meme/favorite/${id}`, { method: 'POST' });
      if (res.ok) {
        const updated = await res.json();
        setSavedMemes((prev) =>
          prev.map((m) => (m.id === id ? { ...m, isFavorite: updated.isFavorite } : m))
        );
        showToast(updated.isFavorite ? 'Added to Favorites! ⭐' : 'Removed from Favorites');
      }
    } catch (err) {
      console.warn('Failed to toggle favorite', err);
    }
  };

  // History Actions
  const handleClearHistory = async () => {
    try {
      await fetch('/api/meme/history', { method: 'DELETE' });
      setHistory([]);
      showToast('Search history cleared');
    } catch (err) {
      console.warn('Failed to clear history', err);
    }
  };

  const handleDeleteHistoryItem = async (id: string) => {
    try {
      await fetch(`/api/meme/history/${id}`, { method: 'DELETE' });
      setHistory((prev) => prev.filter((h) => h.id !== id));
    } catch (err) {
      console.warn('Failed to delete history item', err);
    }
  };

  // Navigate to Finder with a prefilled scenario
  const handleSelectScenarioForFinder = (scen: string) => {
    setFinderScenario(scen);
    setActiveTab('finder');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Open Meme in Studio
  const handleOpenStudio = (meme: MemeItem) => {
    setSelectedStudioMeme(meme);
    setActiveTab('studio');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const savedMemeIds = new Set(savedMemes.map((m) => m.id));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-body selection:bg-purple-600 selection:text-white">
      {/* Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        savedCount={savedMemes.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Finder View */}
        {activeTab === 'finder' && (
          <div className="space-y-6">
            <HeroSection onSelectScenario={handleSelectScenarioForFinder} />
            <MemeFinder
              key={finderScenario}
              initialScenario={finderScenario}
              onSaveMeme={handleSaveMeme}
              savedMemeIds={savedMemeIds}
              onToggleFavorite={handleToggleFavorite}
              onOpenStudio={handleOpenStudio}
            />
          </div>
        )}

        {/* Explore View */}
        {activeTab === 'explore' && (
          <ExploreView
            onSelectForFinder={handleSelectScenarioForFinder}
            onOpenStudio={handleOpenStudio}
            onSaveMeme={handleSaveMeme}
            savedMemeIds={savedMemeIds}
            onToggleFavorite={handleToggleFavorite}
          />
        )}

        {/* AI Meme Studio View */}
        {activeTab === 'studio' && (
          <MemeStudio
            initialMeme={selectedStudioMeme}
            onSaveMeme={handleSaveMeme}
          />
        )}

        {/* Saved Memes View */}
        {activeTab === 'saved' && (
          <MyMemesView
            memes={savedMemes}
            onDeleteMeme={handleDeleteMeme}
            onToggleFavorite={handleToggleFavorite}
            onOpenStudio={handleOpenStudio}
          />
        )}

        {/* History View */}
        {activeTab === 'history' && (
          <HistoryView
            history={history}
            onSelectScenario={handleSelectScenarioForFinder}
            onClearHistory={handleClearHistory}
            onDeleteHistoryItem={handleDeleteHistoryItem}
          />
        )}

        {/* Settings & Setup View */}
        {activeTab === 'settings' && <SettingsView />}
      </main>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900 border border-purple-500/50 shadow-2xl text-xs sm:text-sm font-semibold text-white animate-bounce">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-8 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-display font-extrabold text-sm text-slate-300">
              MemeMind AI
            </span>
            <span>—</span>
            <span>Intelligent Meme Finder & GIF Searcher</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <button onClick={() => setActiveTab('finder')} className="hover:text-purple-400 transition-colors">
              Finder
            </button>
            <button onClick={() => setActiveTab('explore')} className="hover:text-purple-400 transition-colors">
              Explore
            </button>
            <button onClick={() => setActiveTab('studio')} className="hover:text-purple-400 transition-colors">
              AI Studio
            </button>
            <button onClick={() => setActiveTab('settings')} className="hover:text-purple-400 transition-colors">
              Windows Setup
            </button>
          </div>

          <div className="flex items-center gap-2 text-slate-500">
            <span>Powered by Google Gemini 3.8 & GIPHY</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
