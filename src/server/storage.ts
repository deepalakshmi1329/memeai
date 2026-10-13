import fs from 'fs';
import path from 'path';
import { MemeItem, SearchHistoryItem } from './types';

interface StoreData {
  memes: MemeItem[];
  history: SearchHistoryItem[];
  ratings: Array<{
    id: string;
    memeId: string;
    scenario: string;
    rating?: number;
    isPositive?: boolean;
    feedback?: string;
    createdAt: string;
  }>;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'memes_store.json');

// Initialize local store file
function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    const initial: StoreData = {
      memes: [],
      history: [],
      ratings: [],
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2), 'utf-8');
  }
}

function readStore(): StoreData {
  try {
    ensureDataDir();
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading storage file, initializing default:', err);
    return { memes: [], history: [], ratings: [] };
  }
}

function writeStore(data: StoreData): void {
  try {
    ensureDataDir();
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing to storage file:', err);
  }
}

export const StorageService = {
  // Save a meme
  saveMeme(meme: MemeItem): MemeItem {
    const data = readStore();
    const existingIndex = data.memes.findIndex((m) => m.id === meme.id || (m.mediaUrl === meme.mediaUrl && m.scenario === meme.scenario));
    if (existingIndex >= 0) {
      data.memes[existingIndex] = { ...data.memes[existingIndex], ...meme };
      writeStore(data);
      return data.memes[existingIndex];
    }
    data.memes.unshift(meme);
    writeStore(data);
    return meme;
  },

  // Get all saved memes
  getMemes(): MemeItem[] {
    const data = readStore();
    return data.memes;
  },

  // Get single meme
  getMemeById(id: string): MemeItem | undefined {
    const data = readStore();
    return data.memes.find((m) => m.id === id);
  },

  // Toggle favorite
  toggleFavorite(id: string): MemeItem | null {
    const data = readStore();
    const index = data.memes.findIndex((m) => m.id === id);
    if (index >= 0) {
      data.memes[index].isFavorite = !data.memes[index].isFavorite;
      writeStore(data);
      return data.memes[index];
    }
    return null;
  },

  // Delete meme
  deleteMeme(id: string): boolean {
    const data = readStore();
    const initialLen = data.memes.length;
    data.memes = data.memes.filter((m) => m.id !== id);
    if (data.memes.length !== initialLen) {
      writeStore(data);
      return true;
    }
    return false;
  },

  // Search History
  addHistory(item: SearchHistoryItem): void {
    const data = readStore();
    data.history.unshift(item);
    // Keep last 100 history items
    if (data.history.length > 100) {
      data.history = data.history.slice(0, 100);
    }
    writeStore(data);
  },

  getHistory(): SearchHistoryItem[] {
    const data = readStore();
    return data.history;
  },

  deleteHistoryItem(id: string): boolean {
    const data = readStore();
    data.history = data.history.filter((h) => h.id !== id);
    writeStore(data);
    return true;
  },

  clearHistory(): void {
    const data = readStore();
    data.history = [];
    writeStore(data);
  },

  // Record rating & match feedback
  recordRating(rating: {
    memeId: string;
    scenario: string;
    rating?: number;
    isPositive?: boolean;
    feedback?: string;
  }): void {
    const data = readStore();
    const record = {
      id: `rate_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      ...rating,
      createdAt: new Date().toISOString(),
    };
    data.ratings.unshift(record);

    // Update in memes list if present
    const memeIdx = data.memes.findIndex((m) => m.id === rating.memeId);
    if (memeIdx >= 0) {
      data.memes[memeIdx].userRating = {
        isPositive: rating.isPositive,
        rating: rating.rating,
        feedback: rating.feedback,
      };
    }
    writeStore(data);
  },

  getRatings(): StoreData['ratings'] {
    const data = readStore();
    return data.ratings;
  },
};
