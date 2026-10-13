export type MediaType = 'image' | 'gif';
export type ResultType = 'existing' | 'generated';
export type HumorStyle = 
  | 'relatable'
  | 'sarcastic'
  | 'student'
  | 'exam_panic'
  | 'workplace'
  | 'gaming'
  | 'friendship'
  | 'wholesome'
  | 'chaotic'
  | 'dark_safe';

export interface MemeItem {
  id: string;
  scenario: string;
  caption?: string;
  mediaUrl: string;
  mediaType: MediaType;
  resultType: ResultType;
  provider: 'giphy' | 'tenor' | 'imgflip' | 'reddit' | 'gemini_ai' | 'curated' | 'canvas';
  providerId?: string;
  sourceUrl?: string;
  storagePath?: string;
  humorStyle?: string;
  relevanceScore: number; // 0 - 100
  humorScore?: number; // 0 - 100
  reasoning?: string;
  tags?: string[];
  isFavorite?: boolean;
  userRating?: {
    isPositive?: boolean;
    rating?: number;
    feedback?: string;
  };
  createdAt: string;
}

export interface ScenarioAnalysis {
  scenario: string;
  emotion: string;
  humorCore: string;
  recommendedFormat: MediaType | 'both';
  formatRationale: string;
  searchQueries: string[];
  suggestedCaptions: string[];
}

export interface SearchResponse {
  scenario: string;
  analysis: ScenarioAnalysis;
  bestMatch: MemeItem;
  alternatives: MemeItem[];
  totalFound: number;
}

export interface SearchHistoryItem {
  id: string;
  scenario: string;
  humorStyle: string;
  formatPreference: string;
  bestMatch: {
    id?: string;
    mediaUrl: string;
    mediaType: MediaType;
    resultType: ResultType;
    caption?: string;
  };
  createdAt: string;
}

export interface SystemConfigStatus {
  geminiConfigured: boolean;
  geminiModel: string;
  geminiImageModel: string;
  giphyConfigured: boolean;
  tenorConfigured: boolean;
  supabaseConfigured: boolean;
  port: number;
}
