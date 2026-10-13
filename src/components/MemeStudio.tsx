import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Download, 
  Bookmark, 
  Type, 
  Sliders, 
  RotateCcw, 
  Check, 
  Copy, 
  Palette, 
  Wand2, 
  Image as ImageIcon,
  MessageSquare
} from 'lucide-react';
import { MemeItem } from '../server/types';

interface MemeStudioProps {
  initialMeme?: MemeItem | null;
  onSaveMeme: (meme: MemeItem) => void;
}

const DEFAULT_TEMPLATES = [
  { name: 'Two Buttons', url: 'https://i.imgflip.com/1g8my4.jpg' },
  { name: 'Distracted Boyfriend', url: 'https://i.imgflip.com/1bij.jpg' },
  { name: 'Drake Hotline', url: 'https://i.imgflip.com/26am.jpg' },
  { name: 'Woman Yelling at Cat', url: 'https://i.imgflip.com/30b1gx.jpg' },
  { name: 'Roll Safe Big Brain', url: 'https://i.imgflip.com/1h7in3.jpg' },
  { name: 'Buff Doge vs Cheems', url: 'https://i.imgflip.com/43a45p.jpg' },
  { name: 'Panik Kalm Panik', url: 'https://i.imgflip.com/38el31.jpg' },
  { name: 'This Is Fine', url: 'https://media.giphy.com/media/QMHoU66sBXCAU/giphy.gif' },
];

export const MemeStudio: React.FC<MemeStudioProps> = ({ initialMeme, onSaveMeme }) => {
  const [templateUrl, setTemplateUrl] = useState<string>(
    initialMeme?.mediaUrl || DEFAULT_TEMPLATES[0].url
  );
  const [scenarioText, setScenarioText] = useState<string>(
    initialMeme?.scenario || 'When you study all night but blank out on question 1'
  );
  const [topText, setTopText] = useState<string>(
    initialMeme?.caption || 'WHEN I STUDY ALL NIGHT'
  );
  const [bottomText, setBottomText] = useState<string>('AND FORGET MY OWN NAME IN THE EXAM');
  const [memeStyle, setMemeStyle] = useState<'classic' | 'modern' | 'news'>('classic');
  const [fontSize, setFontSize] = useState<number>(36);
  const [textColor, setTextColor] = useState<string>('#FFFFFF');
  const [strokeColor, setStrokeColor] = useState<string>('#000000');
  const [isUppercase, setIsUppercase] = useState<boolean>(true);

  const [aiCaptions, setAiCaptions] = useState<string[]>([]);
  const [isGeneratingCaptions, setIsGeneratingCaptions] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Update when initialMeme changes
  useEffect(() => {
    if (initialMeme) {
      setTemplateUrl(initialMeme.mediaUrl);
      if (initialMeme.scenario) setScenarioText(initialMeme.scenario);
      if (initialMeme.caption) setTopText(initialMeme.caption);
    }
  }, [initialMeme]);

  // Redraw canvas whenever text, template, or style changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = templateUrl;

    img.onload = () => {
      // Determine canvas dimensions
      const width = Math.min(img.width || 600, 800);
      const height = Math.min(img.height || 600, 800);

      if (memeStyle === 'modern') {
        // Modern Twitter/Card style has a top header card
        const headerHeight = 120;
        canvas.width = width;
        canvas.height = height + headerHeight;

        // Draw header card background
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, width, headerHeight);

        // Header scenario text
        ctx.fillStyle = '#f8fafc';
        ctx.font = '600 22px system-ui, sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        
        // Wrap header text
        wrapText(ctx, scenarioText || topText, 25, 60, width - 50, 28);

        // Draw image below
        ctx.drawImage(img, 0, headerHeight, width, height);

        // If bottom text provided in modern mode, draw subtle overlay
        if (bottomText) {
          drawMemeText(ctx, bottomText, width / 2, canvas.height - 30, width - 40, fontSize * 0.8);
        }
      } else if (memeStyle === 'news') {
        // Breaking News meme style
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        // Live News ticker at bottom
        const tickerH = 80;
        ctx.fillStyle = '#dc2626'; // Red banner
        ctx.fillRect(0, height - tickerH, width, 30);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('🔴 BREAKING NEWS', 20, height - tickerH + 20);

        // Yellow text ticker
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(0, height - tickerH + 30, width, 50);
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 20px sans-serif';
        ctx.fillText(isUppercase ? bottomText.toUpperCase() : bottomText, 20, height - 20);
      } else {
        // Classic Impact Top & Bottom
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        if (topText) {
          const tText = isUppercase ? topText.toUpperCase() : topText;
          drawMemeText(ctx, tText, width / 2, fontSize + 15, width - 40, fontSize);
        }

        if (bottomText) {
          const bText = isUppercase ? bottomText.toUpperCase() : bottomText;
          drawMemeText(ctx, bText, width / 2, height - 30, width - 40, fontSize);
        }
      }
    };

    img.onerror = () => {
      // Draw fallback canvas if external image blocks CORS
      canvas.width = 600;
      canvas.height = 500;
      ctx.fillStyle = '#1e1b4b';
      ctx.fillRect(0, 0, 600, 500);

      ctx.fillStyle = '#a855f7';
      ctx.font = 'bold 24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('MemeMind AI Studio', 300, 200);

      drawMemeText(ctx, isUppercase ? topText.toUpperCase() : topText, 300, 80, 560, fontSize);
      drawMemeText(ctx, isUppercase ? bottomText.toUpperCase() : bottomText, 300, 420, 560, fontSize);
    };
  }, [templateUrl, topText, bottomText, scenarioText, memeStyle, fontSize, textColor, strokeColor, isUppercase]);

  // Helper to draw stroke & fill impact text
  const drawMemeText = (
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    size: number
  ) => {
    ctx.font = `900 ${size}px Anton, Impact, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineWidth = Math.max(3, size / 8);
    ctx.strokeStyle = strokeColor;
    ctx.fillStyle = textColor;
    ctx.lineJoin = 'round';

    ctx.strokeText(text, x, y, maxWidth);
    ctx.fillText(text, x, y, maxWidth);
  };

  // Helper to wrap text for modern cards
  const wrapText = (
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number
  ) => {
    const words = text.split(' ');
    let line = '';
    let currentY = y;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {
        ctx.fillText(line, x, currentY);
        line = words[n] + ' ';
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, currentY);
  };

  // Generate AI Punchlines
  const handleGenerateCaptions = async () => {
    if (!scenarioText.trim()) return;
    setIsGeneratingCaptions(true);
    try {
      const res = await fetch('/api/meme/generate-captions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario: scenarioText, humorStyle: 'relatable' }),
      });
      const data = await res.json();
      if (data.captions && Array.isArray(data.captions)) {
        setAiCaptions(data.captions);
      }
    } catch (err) {
      console.warn('Failed to generate punchlines', err);
    } finally {
      setIsGeneratingCaptions(false);
    }
  };

  // Download compiled Canvas image as PNG
  const handleDownloadMeme = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `mememind_custom_${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  // Save to My Memes collection
  const handleSaveToCollection = () => {
    const canvas = canvasRef.current;
    const dataUrl = canvas ? canvas.toDataURL('image/png') : templateUrl;

    const newMeme: MemeItem = {
      id: `studio_${Date.now()}`,
      scenario: scenarioText || topText,
      caption: topText ? `${topText} — ${bottomText}` : bottomText,
      mediaUrl: dataUrl,
      mediaType: 'image',
      resultType: 'generated',
      provider: 'canvas',
      relevanceScore: 100,
      humorScore: 95,
      reasoning: 'Custom created in MemeMind AI Studio',
      tags: ['studio', 'custom', memeStyle],
      createdAt: new Date().toISOString(),
    };

    onSaveMeme(newMeme);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h2 className="text-2xl font-bold font-display text-white flex items-center gap-2">
            <Palette className="w-6 h-6 text-purple-400" />
            AI Meme Studio & Canvas Editor
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Combine any meme template or reaction with AI-crafted punchlines, custom styling, and instant export.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSaveToCollection}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-colors shadow-lg shadow-purple-600/20"
          >
            {savedSuccess ? <Check className="w-4 h-4 text-emerald-300" /> : <Bookmark className="w-4 h-4" />}
            <span>{savedSuccess ? 'Saved!' : 'Save to Collection'}</span>
          </button>

          <button
            onClick={handleDownloadMeme}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold text-xs border border-slate-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export PNG</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Canvas Preview */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center p-6 rounded-3xl border border-slate-800 bg-slate-900/60 shadow-xl">
          <div className="w-full flex items-center justify-between mb-3 text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider text-purple-400">
              Live Canvas Preview
            </span>
            <span>Right-click or click Export to download</span>
          </div>

          <div className="w-full overflow-hidden rounded-2xl bg-black border border-slate-800 flex items-center justify-center p-2 shadow-inner">
            <canvas
              ref={canvasRef}
              className="max-w-full h-auto max-h-[550px] object-contain rounded-lg shadow-2xl"
            />
          </div>
        </div>

        {/* Right Column: Controls, Captions & AI Suggestions */}
        <div className="lg:col-span-5 space-y-6">
          {/* Layout Style Selector */}
          <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-3">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Meme Layout Style:
            </span>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'classic' as const, label: 'Classic Impact' },
                { id: 'modern' as const, label: 'Tweet / Card' },
                { id: 'news' as const, label: 'News Ticker' },
              ].map((style) => (
                <button
                  key={style.id}
                  onClick={() => setMemeStyle(style.id)}
                  className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition-all ${
                    memeStyle === style.id
                      ? 'bg-purple-600/20 border-purple-500 text-purple-200'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {style.label}
                </button>
              ))}
            </div>
          </div>

          {/* Text Inputs */}
          <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                {memeStyle === 'modern' ? 'Scenario / Header Question:' : 'Top Text:'}
              </label>
              <input
                type="text"
                value={memeStyle === 'modern' ? scenarioText : topText}
                onChange={(e) => {
                  if (memeStyle === 'modern') setScenarioText(e.target.value);
                  else setTopText(e.target.value);
                }}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-sm text-white focus:border-purple-500"
                placeholder="Top headline..."
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                {memeStyle === 'modern' ? 'Sub-caption (Optional):' : 'Bottom Text / Punchline:'}
              </label>
              <input
                type="text"
                value={bottomText}
                onChange={(e) => setBottomText(e.target.value)}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-sm text-white focus:border-purple-500"
                placeholder="Bottom punchline..."
              />
            </div>

            {/* Typography Controls */}
            <div className="pt-2 border-t border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Font Size ({fontSize}px)</span>
                <input
                  type="range"
                  min="20"
                  max="64"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-32 accent-purple-500"
                />
              </div>

              <div className="flex items-center justify-between gap-4">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isUppercase}
                    onChange={(e) => setIsUppercase(e.target.checked)}
                    className="rounded accent-purple-500"
                  />
                  <span>ALL CAPS (Classic Meme)</span>
                </label>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Color:</span>
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-6 h-6 rounded border border-slate-700 bg-transparent cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* AI Punchline Assistant */}
          <div className="p-4 rounded-2xl border border-purple-500/30 bg-purple-950/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5 uppercase tracking-wider">
                <Wand2 className="w-4 h-4 text-purple-400" />
                Gemini Punchline Writer
              </span>
              <button
                onClick={handleGenerateCaptions}
                disabled={isGeneratingCaptions}
                className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 transition-colors"
              >
                {isGeneratingCaptions ? 'Writing...' : 'Generate 5 Captions'}
              </button>
            </div>

            {aiCaptions.length > 0 ? (
              <div className="space-y-1.5 pt-1">
                {aiCaptions.map((caption, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      if (memeStyle === 'modern') {
                        setScenarioText(caption);
                      } else {
                        const parts = caption.split(':');
                        if (parts.length > 1) {
                          setTopText(parts[0].trim());
                          setBottomText(parts.slice(1).join(':').trim());
                        } else {
                          setBottomText(caption);
                        }
                      }
                    }}
                    className="w-full text-left p-2 rounded-xl bg-slate-900/80 hover:bg-purple-900/40 border border-slate-800 hover:border-purple-500/50 text-xs text-slate-200 transition-colors flex items-center justify-between group"
                  >
                    <span className="truncate pr-2">"{caption}"</span>
                    <span className="text-[10px] text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      Apply
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">
                Click "Generate 5 Captions" to have Google Gemini write witty punchlines tailored to your current scenario.
              </p>
            )}
          </div>

          {/* Template Picker */}
          <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-3">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Choose Iconic Template:
            </span>
            <div className="grid grid-cols-4 gap-2">
              {DEFAULT_TEMPLATES.map((tmpl, idx) => (
                <button
                  key={idx}
                  onClick={() => setTemplateUrl(tmpl.url)}
                  className={`rounded-xl overflow-hidden border p-1 transition-all ${
                    templateUrl === tmpl.url
                      ? 'border-purple-500 ring-2 ring-purple-500/40 bg-purple-950/40'
                      : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                  }`}
                  title={tmpl.name}
                >
                  <img
                    src={tmpl.url}
                    alt={tmpl.name}
                    className="w-full h-14 object-cover rounded-lg"
                    referrerPolicy="no-referrer"
                  />
                  <span className="text-[10px] text-slate-300 truncate block text-center mt-1">
                    {tmpl.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
