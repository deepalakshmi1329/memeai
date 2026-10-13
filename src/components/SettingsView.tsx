import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Key, 
  Terminal, 
  Database, 
  CheckCircle2, 
  XCircle, 
  Copy, 
  Check, 
  ExternalLink, 
  FileCode, 
  Cpu, 
  HelpCircle,
  Laptop
} from 'lucide-react';
import { SystemConfigStatus } from '../server/types';

export const SettingsView: React.FC = () => {
  const [config, setConfig] = useState<SystemConfigStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'status' | 'windows' | 'supabase'>('status');

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/config-status');
      const data = await res.json();
      setConfig(data);
    } catch (err) {
      console.warn('Failed to fetch config', err);
    } finally {
      setLoading(false);
    }
  };

  const copyCode = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const powershellCommands = `# 1. Open project folder in VS Code
cd "C:\\Users\\YourUsername\\Projects\\MemeMind-AI"
code .

# 2. Install all dependencies
npm install

# 3. Create .env from template
Copy-Item .env.example .env

# 4. Open .env to edit your Gemini API key (or GIPHY/Supabase keys)
notepad .env

# 5. Start the full-stack server
npm run dev

# 6. Open the app in your browser at:
# http://localhost:3000

# 7. (Optional) Run tests and TypeScript linter
npm run lint

# 8. (Optional) Commit and push to GitHub safely (never commits secret keys)
git status
git add .
git commit -m "feat: complete MemeMind AI intelligent meme generator"
git push origin main
`;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h2 className="text-2xl font-bold font-display text-white flex items-center gap-2">
            <Settings className="w-6 h-6 text-purple-400" />
            System Configuration & Setup Guide
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Real API integration status, Windows PowerShell commands, and Supabase database instructions.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800">
          <button
            onClick={() => setActiveTab('status')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'status' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            API Status
          </button>
          <button
            onClick={() => setActiveTab('windows')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ${
              activeTab === 'windows' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Laptop className="w-3.5 h-3.5" />
            Windows & VS Code
          </button>
          <button
            onClick={() => setActiveTab('supabase')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ${
              activeTab === 'supabase' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            Supabase DB
          </button>
        </div>
      </div>

      {/* Tab 1: API Status */}
      {activeTab === 'status' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Gemini Status */}
            <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-200 flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-purple-400" />
                  Google Gemini API
                </span>
                {config?.geminiConfigured ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-800/60">
                    <CheckCircle2 className="w-3 h-3" /> Connected
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-800/60">
                    <XCircle className="w-3 h-3" /> Key Missing
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Powers scenario comprehension, humor analysis, relevance scoring, captions, and AI meme generation.
              </p>
              <div className="text-[11px] font-mono text-purple-300 bg-purple-950/30 p-2 rounded-lg border border-purple-900/40">
                Text Model: {config?.geminiModel || 'gemini-3.8-flash'}<br />
                Image Model: {config?.geminiImageModel || 'gemini-3.1-flash-lite-image'}
              </div>
              <a
                href="https://aistudio.google.com/apikey"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 font-semibold"
              >
                <span>Get Gemini Key in Google AI Studio</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* GIPHY & GIF Status */}
            <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-200 flex items-center gap-2">
                  <Key className="w-4 h-4 text-cyan-400" />
                  GIPHY / Tenor GIF Search
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-800/60">
                  <CheckCircle2 className="w-3 h-3" /> Active & Searchable
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Live GIPHY search API endpoint active with public beta credentials + curated high-speed reaction cache.
              </p>
              <div className="text-[11px] font-mono text-slate-300 bg-slate-950 p-2 rounded-lg border border-slate-800">
                Optional custom key: <br />
                <code className="text-cyan-300">GIPHY_API_KEY="..."</code> in .env
              </div>
              <a
                href="https://developers.giphy.com/docs/api/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
              >
                <span>GIPHY Developer Portal</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Storage Status */}
            <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-200 flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-400" />
                  Database & Storage
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-800/60">
                  <CheckCircle2 className="w-3 h-3" /> Disk JSON Active
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Local persistent JSON store saves memes, history, and ratings in <code className="text-slate-300">data/memes_store.json</code>.
              </p>
              <div className="text-[11px] font-mono text-slate-300 bg-slate-950 p-2 rounded-lg border border-slate-800">
                Supabase integration: {config?.supabaseConfigured ? 'Connected' : 'Optional (Ready)'}
              </div>
              <button
                onClick={() => setActiveTab('supabase')}
                className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
              >
                <span>View Supabase PostgreSQL Schema</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Windows & VS Code Setup */}
      {activeTab === 'windows' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl border border-purple-500/30 bg-purple-950/20">
            <h3 className="font-bold text-base text-purple-200 mb-2 flex items-center gap-2">
              <Laptop className="w-5 h-5 text-purple-400" />
              Running MemeMind AI Locally on Windows 10 / 11
            </h3>
            <p className="text-xs sm:text-sm text-purple-300/90 leading-relaxed">
              Follow these simple steps in Windows PowerShell to install, configure, and launch the application on your computer.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Terminal className="w-4 h-4 text-purple-400" />
                PowerShell Commands:
              </span>
              <button
                onClick={() => copyCode('ps', powershellCommands)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors"
              >
                {copiedKey === 'ps' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'ps' ? 'Copied to Clipboard!' : 'Copy Commands'}</span>
              </button>
            </div>

            <pre className="p-4 rounded-2xl bg-black border border-slate-800 text-slate-200 font-mono text-xs leading-relaxed overflow-x-auto shadow-inner">
              {powershellCommands}
            </pre>
          </div>

          {/* Step by Step Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <div className="w-6 h-6 rounded-full bg-purple-600 text-white font-bold text-xs flex items-center justify-center mb-2">
                1
              </div>
              <h4 className="font-bold text-sm text-slate-200 mb-1">Prerequisites</h4>
              <p className="text-xs text-slate-400">
                Install <strong>Node.js LTS (v20+)</strong> and <strong>VS Code</strong>. Ensure PowerShell execution policy allows running scripts.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <div className="w-6 h-6 rounded-full bg-purple-600 text-white font-bold text-xs flex items-center justify-center mb-2">
                2
              </div>
              <h4 className="font-bold text-sm text-slate-200 mb-1">Set GEMINI_API_KEY</h4>
              <p className="text-xs text-slate-400">
                In your <code className="text-purple-300">.env</code> file, paste your free Gemini API key from Google AI Studio.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <div className="w-6 h-6 rounded-full bg-purple-600 text-white font-bold text-xs flex items-center justify-center mb-2">
                3
              </div>
              <h4 className="font-bold text-sm text-slate-200 mb-1">Run and Test</h4>
              <p className="text-xs text-slate-400">
                Run <code className="text-purple-300">npm run dev</code>. The server launches on port 3000, serving both API and frontend!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Supabase Schema */}
      {activeTab === 'supabase' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl border border-emerald-500/30 bg-emerald-950/20">
            <h3 className="font-bold text-base text-emerald-200 mb-2 flex items-center gap-2">
              <Database className="w-5 h-5 text-emerald-400" />
              Supabase PostgreSQL Database Integration
            </h3>
            <p className="text-xs sm:text-sm text-emerald-300/90 leading-relaxed">
              MemeMind AI includes a complete SQL schema in <code className="font-mono text-white">supabase_schema.sql</code>. If you wish to use Supabase instead of local JSON storage, run this script in your Supabase SQL Editor.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <FileCode className="w-4 h-4 text-emerald-400" />
                supabase_schema.sql (Included in project root):
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-black border border-slate-800 font-mono text-xs text-slate-300 space-y-2">
              <p className="text-emerald-400">-- 1. Run this in your Supabase Project &gt; SQL Editor</p>
              <p>-- Tables created: <span className="text-purple-300">memes</span>, <span className="text-purple-300">search_history</span>, <span className="text-purple-300">meme_ratings</span></p>
              <p>-- Row Level Security (RLS) policies included for public read/write access.</p>
              <p className="text-slate-500">-- Open the file 'supabase_schema.sql' in VS Code to view or execute the full migration.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
