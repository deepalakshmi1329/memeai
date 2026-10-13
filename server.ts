import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GeminiService } from './src/server/geminiService';
import { searchAllMediaSources } from './src/server/memeSearch';
import { StorageService } from './src/server/storage';
import { CURATED_MEMES } from './src/server/memeCatalog';
import { MemeItem, SearchHistoryItem, SystemConfigStatus } from './src/server/types';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '20mb' }));

// Helper to sanitize scenario string
function sanitizeString(str: any, maxLen = 300): string {
  if (typeof str !== 'string') return '';
  return str.trim().slice(0, maxLen);
}

// 1. System Config Status endpoint (Never leaks actual secret keys)
app.get('/api/config-status', (req: Request, res: Response) => {
  const status: SystemConfigStatus = {
    geminiConfigured: GeminiService.isConfigured(),
    geminiModel: process.env.GEMINI_TEXT_MODEL || 'gemini-3.8-flash',
    geminiImageModel: process.env.GEMINI_IMAGE_MODEL || 'gemini-3.1-flash-lite-image',
    giphyConfigured: Boolean(process.env.GIPHY_API_KEY),
    tenorConfigured: Boolean(process.env.TENOR_API_KEY),
    supabaseConfigured: Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY),
    port: PORT,
  };
  res.json(status);
});

// 2. Main Search & Analysis Route
app.post('/api/meme/search', async (req: Request, res: Response) => {
  try {
    const scenario = sanitizeString(req.body.scenario);
    const humorStyle = sanitizeString(req.body.humorStyle) || 'relatable';
    const formatPreference = (req.body.formatPreference || 'all') as 'all' | 'gif' | 'image' | 'ai';

    if (!scenario) {
      return res.status(400).json({ error: 'Please provide a scenario to find or generate a meme.' });
    }

    // Stage 1: Analyze scenario with Gemini
    const analysis = await GeminiService.analyzeScenario(scenario, humorStyle);

    // If user explicitly requests AI generation
    if (formatPreference === 'ai') {
      const aiResult = await GeminiService.generateMemeImage(scenario);
      const generatedMeme: MemeItem = {
        id: `gen_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        scenario,
        caption: aiResult.caption,
        mediaUrl: aiResult.imageUrl || 'https://i.imgflip.com/1g8my4.jpg',
        mediaType: 'image',
        resultType: 'generated',
        provider: 'gemini_ai',
        relevanceScore: 98,
        humorScore: 95,
        reasoning: `AI-generated custom meme tailored for: "${scenario}"`,
        tags: [humorStyle, 'ai_generated', 'custom'],
        createdAt: new Date().toISOString(),
      };

      // Save to history
      StorageService.addHistory({
        id: `hist_${Date.now()}`,
        scenario,
        humorStyle,
        formatPreference: 'ai',
        bestMatch: {
          id: generatedMeme.id,
          mediaUrl: generatedMeme.mediaUrl,
          mediaType: generatedMeme.mediaType,
          resultType: generatedMeme.resultType,
          caption: generatedMeme.caption,
        },
        createdAt: new Date().toISOString(),
      });

      return res.json({
        scenario,
        analysis,
        bestMatch: generatedMeme,
        alternatives: [],
        totalFound: 1,
      });
    }

    // Stage 2: Search real external media sources (GIPHY, Tenor, Imgflip, Curated)
    const effectiveFormatPref = formatPreference === 'all' ? undefined : formatPreference;
    const candidates = await searchAllMediaSources({
      queries: analysis.searchQueries,
      formatPreference: effectiveFormatPref,
    });

    if (candidates.length === 0) {
      // Fallback to AI generation if no candidates found
      const aiResult = await GeminiService.generateMemeImage(scenario);
      const generatedMeme: MemeItem = {
        id: `gen_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        scenario,
        caption: aiResult.caption,
        mediaUrl: aiResult.imageUrl || 'https://i.imgflip.com/1g8my4.jpg',
        mediaType: 'image',
        resultType: 'generated',
        provider: 'gemini_ai',
        relevanceScore: 90,
        humorScore: 90,
        reasoning: 'No exact internet match found; generated an original AI meme.',
        tags: [humorStyle, 'ai_generated'],
        createdAt: new Date().toISOString(),
      };

      return res.json({
        scenario,
        analysis,
        bestMatch: generatedMeme,
        alternatives: [],
        totalFound: 1,
      });
    }

    // Stage 3: Rank candidates with Gemini
    const rankingResult = await GeminiService.rankCandidates(
      scenario,
      candidates,
      analysis.recommendedFormat
    );

    const bestMatch = rankingResult.ranked[0] || candidates[0];
    bestMatch.scenario = scenario;
    if (analysis.suggestedCaptions.length > 0 && !bestMatch.caption) {
      bestMatch.caption = analysis.suggestedCaptions[0];
    }

    const alternatives = rankingResult.ranked.slice(1, 10).map((item) => ({
      ...item,
      scenario,
    }));

    // Record in history
    StorageService.addHistory({
      id: `hist_${Date.now()}`,
      scenario,
      humorStyle,
      formatPreference,
      bestMatch: {
        id: bestMatch.id,
        mediaUrl: bestMatch.mediaUrl,
        mediaType: bestMatch.mediaType,
        resultType: bestMatch.resultType,
        caption: bestMatch.caption,
      },
      createdAt: new Date().toISOString(),
    });

    return res.json({
      scenario,
      analysis,
      bestMatch,
      alternatives,
      totalFound: candidates.length,
    });
  } catch (err: any) {
    console.error('Search route error:', err);
    res.status(500).json({ error: err?.message || 'Failed to search memes.' });
  }
});

// 3. Generate AI Meme
app.post('/api/meme/generate-ai', async (req: Request, res: Response) => {
  try {
    const scenario = sanitizeString(req.body.scenario);
    const promptDetails = sanitizeString(req.body.promptDetails);
    if (!scenario) {
      return res.status(400).json({ error: 'Scenario is required.' });
    }

    const result = await GeminiService.generateMemeImage(scenario, promptDetails);
    const meme: MemeItem = {
      id: `ai_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      scenario,
      caption: result.caption,
      mediaUrl: result.imageUrl || 'https://i.imgflip.com/1g8my4.jpg',
      mediaType: 'image',
      resultType: 'generated',
      provider: 'gemini_ai',
      relevanceScore: 98,
      humorScore: 95,
      reasoning: `AI-generated visual concept: ${result.description}`,
      tags: ['ai_generated', 'original'],
      createdAt: new Date().toISOString(),
    };

    res.json(meme);
  } catch (err: any) {
    console.error('Generate AI meme error:', err);
    res.status(500).json({ error: err?.message || 'Failed to generate meme.' });
  }
});

// 4. Generate AI Captions for any scenario or image
app.post('/api/meme/generate-captions', async (req: Request, res: Response) => {
  try {
    const scenario = sanitizeString(req.body.scenario);
    const humorStyle = sanitizeString(req.body.humorStyle) || 'relatable';
    if (!scenario) {
      return res.status(400).json({ error: 'Scenario is required.' });
    }

    const captions = await GeminiService.generateCaptions(scenario, humorStyle, 5);
    res.json({ captions });
  } catch (err: any) {
    console.error('Generate captions error:', err);
    res.status(500).json({ error: err?.message || 'Failed to generate captions.' });
  }
});

// 5. Trending Memes & GIFs
app.get('/api/meme/trending', async (req: Request, res: Response) => {
  try {
    const trendingItems: MemeItem[] = CURATED_MEMES.slice(0, 20).map((c, i) => ({
      ...c,
      id: `trend_${i}`,
      scenario: 'Trending Internet Culture',
      relevanceScore: 95,
      createdAt: new Date().toISOString(),
    }));
    res.json({ trending: trendingItems });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch trending memes.' });
  }
});

// 6. Saved Memes CRUD
app.get('/api/meme/saved', (req: Request, res: Response) => {
  const memes = StorageService.getMemes();
  res.json({ memes });
});

app.post('/api/meme/save', (req: Request, res: Response) => {
  const meme = req.body;
  if (!meme || !meme.mediaUrl) {
    return res.status(400).json({ error: 'Invalid meme payload.' });
  }
  const saved = StorageService.saveMeme(meme);
  res.json(saved);
});

app.delete('/api/meme/saved/:id', (req: Request, res: Response) => {
  const id = req.params.id;
  const deleted = StorageService.deleteMeme(id);
  res.json({ success: deleted });
});

app.post('/api/meme/favorite/:id', (req: Request, res: Response) => {
  const id = req.params.id;
  const updated = StorageService.toggleFavorite(id);
  if (!updated) {
    return res.status(404).json({ error: 'Meme not found.' });
  }
  res.json(updated);
});

app.get('/api/meme/favorites', (req: Request, res: Response) => {
  const memes = StorageService.getMemes().filter((m) => m.isFavorite);
  res.json({ favorites: memes });
});

// 7. Search History
app.get('/api/meme/history', (req: Request, res: Response) => {
  const history = StorageService.getHistory();
  res.json({ history });
});

app.delete('/api/meme/history/:id', (req: Request, res: Response) => {
  const id = req.params.id;
  StorageService.deleteHistoryItem(id);
  res.json({ success: true });
});

app.delete('/api/meme/history', (req: Request, res: Response) => {
  StorageService.clearHistory();
  res.json({ success: true });
});

// 8. Rating & Match Feedback
app.post('/api/meme/rate', (req: Request, res: Response) => {
  const { memeId, scenario, rating, isPositive, feedback } = req.body;
  if (!memeId || !scenario) {
    return res.status(400).json({ error: 'memeId and scenario required.' });
  }
  StorageService.recordRating({ memeId, scenario, rating, isPositive, feedback });
  res.json({ success: true });
});

// Vite Middleware integration for Full-Stack App
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(process.cwd(), 'dist/index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 MemeMind AI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
