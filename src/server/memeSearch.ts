import { MemeItem } from './types';
import { CURATED_MEMES } from './memeCatalog';

interface ExternalSearchResult {
  items: MemeItem[];
  source: 'giphy' | 'tenor' | 'imgflip' | 'curated';
}

// GIPHY API Search
async function searchGiphy(query: string, limit = 8): Promise<MemeItem[]> {
  const apiKey = process.env.GIPHY_API_KEY;
  if (!apiKey || apiKey === 'MY_GIPHY_API_KEY') {
    return [];
  }
  try {
    const url = `https://api.giphy.com/v1/gifs/search?api_key=${encodeURIComponent(apiKey)}&q=${encodeURIComponent(query)}&limit=${limit}&rating=pg-13&lang=en`;
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) {
      return [];
    }
    const data = await res.json();
    if (!data.data || !Array.isArray(data.data)) return [];

    return data.data.map((item: any) => {
      const gifUrl = item.images?.original?.url || item.images?.downsized?.url || item.images?.fixed_height?.url;
      return {
        id: `giphy_${item.id}`,
        scenario: '',
        caption: item.title || query,
        mediaUrl: gifUrl,
        mediaType: 'gif' as const,
        resultType: 'existing' as const,
        provider: 'giphy' as const,
        providerId: item.id,
        sourceUrl: item.url || `https://giphy.com/gifs/${item.id}`,
        relevanceScore: 75,
        tags: [query, ...(item.tags || [])],
        createdAt: new Date().toISOString(),
      };
    }).filter((m: MemeItem) => Boolean(m.mediaUrl));
  } catch {
    return [];
  }
}

// Public Reddit Reaction GIFs search (No API key needed, strictly public JSON)
async function searchRedditGifs(query: string, limit = 6): Promise<MemeItem[]> {
  try {
    const cleanQuery = query.replace(/[^\w\s]/gi, '').trim();
    const url = `https://www.reddit.com/r/reactiongifs/search.json?q=${encodeURIComponent(cleanQuery)}&restrict_sr=1&sort=relevance&limit=${limit}`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'MemeMindAI/1.0 (reaction search bot)',
      },
    });
    if (!res.ok) return [];
    const data = await res.json();
    const posts = data?.data?.children || [];
    const results: MemeItem[] = [];

    for (const p of posts) {
      const post = p.data;
      if (!post) continue;
      let gifUrl = post.url;
      // Convert imgur gifv to gif if needed
      if (gifUrl?.endsWith('.gifv')) {
        gifUrl = gifUrl.replace('.gifv', '.gif');
      }
      if (gifUrl && (gifUrl.endsWith('.gif') || post.post_hint === 'image')) {
        results.push({
          id: `reddit_${post.id}`,
          scenario: '',
          caption: post.title || query,
          mediaUrl: gifUrl,
          mediaType: 'gif',
          resultType: 'existing',
          provider: 'reddit',
          providerId: post.id,
          sourceUrl: `https://reddit.com${post.permalink}`,
          relevanceScore: 78,
          tags: [query, 'reactiongif', 'reddit'],
          createdAt: new Date().toISOString(),
        });
      }
    }
    return results;
  } catch {
    return [];
  }
}

// Tenor API Search
async function searchTenor(query: string, limit = 8): Promise<MemeItem[]> {
  const apiKey = process.env.TENOR_API_KEY;
  if (!apiKey) return [];
  try {
    const url = `https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(query)}&key=${encodeURIComponent(apiKey)}&limit=${limit}&contentfilter=medium`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    if (!data.results || !Array.isArray(data.results)) return [];

    return data.results.map((item: any) => {
      const gifFormat = item.media_formats?.gif || item.media_formats?.mediumgif || item.media_formats?.tinygif;
      return {
        id: `tenor_${item.id}`,
        scenario: '',
        caption: item.content_description || query,
        mediaUrl: gifFormat?.url,
        mediaType: 'gif' as const,
        resultType: 'existing' as const,
        provider: 'tenor' as const,
        providerId: item.id,
        sourceUrl: item.itemurl || `https://tenor.com/view/${item.id}`,
        relevanceScore: 70,
        tags: [query, ...(item.tags || [])],
        createdAt: new Date().toISOString(),
      };
    }).filter((m: MemeItem) => Boolean(m.mediaUrl));
  } catch (err) {
    console.warn('Tenor search network error:', err);
    return [];
  }
}

// Imgflip Popular Meme Templates
let cachedImgflipMemes: any[] = [];
let lastImgflipFetch = 0;

async function getImgflipMemes(): Promise<any[]> {
  const now = Date.now();
  if (cachedImgflipMemes.length > 0 && now - lastImgflipFetch < 1000 * 60 * 60) {
    return cachedImgflipMemes;
  }
  try {
    const res = await fetch('https://api.imgflip.com/get_memes');
    if (!res.ok) return cachedImgflipMemes;
    const json = await res.json();
    if (json.success && Array.isArray(json.data?.memes)) {
      cachedImgflipMemes = json.data.memes;
      lastImgflipFetch = now;
      return cachedImgflipMemes;
    }
  } catch (err) {
    console.warn('Imgflip fetch error:', err);
  }
  return cachedImgflipMemes;
}

// Search static memes from Imgflip catalog by keywords
async function searchStaticMemes(queries: string[]): Promise<MemeItem[]> {
  const templates = await getImgflipMemes();
  if (!templates || templates.length === 0) return [];

  const matched: MemeItem[] = [];
  const queryTokens = queries.flatMap((q) => q.toLowerCase().split(/\s+/)).filter(Boolean);

  for (const t of templates) {
    const nameLower = (t.name || '').toLowerCase();
    let score = 0;
    for (const token of queryTokens) {
      if (token.length > 2 && nameLower.includes(token)) {
        score += 25;
      }
    }
    if (score > 0) {
      matched.push({
        id: `imgflip_${t.id}`,
        scenario: '',
        caption: t.name,
        mediaUrl: t.url,
        mediaType: 'image',
        resultType: 'existing',
        provider: 'imgflip',
        providerId: String(t.id),
        sourceUrl: `https://imgflip.com/meme/${t.id}`,
        relevanceScore: Math.min(score, 90),
        tags: [t.name],
        createdAt: new Date().toISOString(),
      });
    }
  }

  return matched.slice(0, 10);
}

// Search Curated Library
function searchCurated(queries: string[], formatPref?: string): MemeItem[] {
  const queryTokens = queries.flatMap((q) => q.toLowerCase().split(/\s+/)).filter((t) => t.length > 2);
  const results: Array<{ meme: MemeItem; matchScore: number }> = [];

  for (const item of CURATED_MEMES) {
    // Format filtering
    if (formatPref === 'gif' && item.mediaType !== 'gif') continue;
    if (formatPref === 'image' && item.mediaType !== 'image') continue;

    let score = 0;
    const itemText = [
      item.caption || '',
      item.reasoning || '',
      ...(item.tags || []),
    ].join(' ').toLowerCase();

    for (const token of queryTokens) {
      if (itemText.includes(token)) {
        score += 15;
      }
    }

    // Baseline relevance
    if (score > 0) {
      results.push({
        meme: {
          ...item,
          id: `curated_${Math.random().toString(36).substring(2, 9)}`,
          scenario: '',
          relevanceScore: Math.min(50 + score, 95),
          createdAt: new Date().toISOString(),
        },
        matchScore: score,
      });
    } else {
      // Add as gentle fallback candidate
      results.push({
        meme: {
          ...item,
          id: `curated_${Math.random().toString(36).substring(2, 9)}`,
          scenario: '',
          relevanceScore: 50,
          createdAt: new Date().toISOString(),
        },
        matchScore: 0,
      });
    }
  }

  // Sort by match score
  results.sort((a, b) => b.matchScore - a.matchScore);
  return results.slice(0, 12).map((r) => r.meme);
}

// Master Search Orchestrator
export async function searchAllMediaSources(params: {
  queries: string[];
  formatPreference?: 'all' | 'gif' | 'image' | 'ai';
}): Promise<MemeItem[]> {
  const { queries, formatPreference = 'all' } = params;
  const allCandidates: MemeItem[] = [];

  // Search in parallel across external sources
  const searchTasks: Array<Promise<MemeItem[]>> = [];

  // 1. Live GIF Search (GIPHY, Tenor, Reddit Reaction GIFs)
  if (formatPreference !== 'image') {
    const primaryQuery = queries[0] || 'funny reaction';
    const secondaryQuery = queries[1] || 'meme panic';
    searchTasks.push(searchGiphy(primaryQuery, 6));
    if (secondaryQuery !== primaryQuery) {
      searchTasks.push(searchGiphy(secondaryQuery, 4));
    }
    searchTasks.push(searchTenor(primaryQuery, 4));
    searchTasks.push(searchRedditGifs(primaryQuery, 4));
  }

  // 2. Static Meme templates (if format is 'all' or 'image')
  if (formatPreference !== 'gif') {
    searchTasks.push(searchStaticMemes(queries));
  }

  const resultsFromApis = await Promise.allSettled(searchTasks);
  for (const res of resultsFromApis) {
    if (res.status === 'fulfilled' && Array.isArray(res.value)) {
      allCandidates.push(...res.value);
    }
  }

  // 3. Curated Library backup & diversity
  const curatedResults = searchCurated(queries, formatPreference);
  allCandidates.push(...curatedResults);

  // Deduplicate by mediaUrl
  const seenUrls = new Set<string>();
  const deduplicated: MemeItem[] = [];

  for (const item of allCandidates) {
    if (!item.mediaUrl) continue;
    if (seenUrls.has(item.mediaUrl)) continue;
    seenUrls.add(item.mediaUrl);
    deduplicated.push(item);
  }

  return deduplicated;
}
