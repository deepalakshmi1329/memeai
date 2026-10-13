import { GoogleGenAI, Type } from '@google/genai';
import { ScenarioAnalysis, MemeItem } from './types';

// Shared Gemini Client
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

const TEXT_MODEL = process.env.GEMINI_TEXT_MODEL || 'gemini-3.8-flash';
const IMAGE_MODEL = process.env.GEMINI_IMAGE_MODEL || 'gemini-3.1-flash-lite-image';

export const GeminiService = {
  isConfigured(): boolean {
    return Boolean(process.env.GEMINI_API_KEY);
  },

  // 1. Analyze Scenario, extract emotion/context, decide format, generate queries
  async analyzeScenario(scenario: string, humorStyle = 'relatable'): Promise<ScenarioAnalysis> {
    const ai = getGeminiClient();

    // Fallback heuristic if no Gemini API key is configured yet
    if (!ai) {
      const lower = scenario.toLowerCase();
      const isDynamic = lower.includes('when') || lower.includes('realize') || lower.includes('panic') || lower.includes('sudden');
      return {
        scenario,
        emotion: isDynamic ? 'Panic & Shock' : 'Relatable Irony',
        humorCore: 'The contrast between high expectations and tragic reality',
        recommendedFormat: isDynamic ? 'gif' : 'both',
        formatRationale: isDynamic
          ? 'Animated reactions better convey the sudden dramatic realization and panic in this scenario.'
          : 'Both static image templates and animated reactions provide strong comedic timing for this dilemma.',
        searchQueries: [
          `${scenario.slice(0, 30)} meme`,
          'reaction panic gif',
          'exam study fail',
          'confused blank mind',
        ],
        suggestedCaptions: [
          'Me 5 minutes into the test:',
          'My last two brain cells during the exam:',
          'Studying for 12 hours just to write my name correctly:',
        ],
      };
    }

    try {
      const prompt = `Analyze this user scenario for an intelligent meme generator.
Scenario: "${scenario}"
Requested Humor Style: ${humorStyle}

Tasks:
1. Identify the core emotion and humor mechanism (irony, exaggeration, panic, awkwardness, etc.).
2. Determine whether an Animated GIF or a Static Image is funniest for this situation:
   - Animated GIF is better for: shock, sudden panic, dramatic realization, physical comedy, awkward eye contact, hysterical reactions.
   - Static Image is better for: contrast, two options dilemma, witty quotes, structured before/after comparison.
   - 'both' if equally strong.
3. Generate 4-6 specific search phrases (keywords that return iconic reaction GIFs or famous meme templates).
4. Generate 3 funny, punchy meme captions tailored to this situation.`;

      const response = await ai.models.generateContent({
        model: TEXT_MODEL,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              emotion: { type: Type.STRING },
              humorCore: { type: Type.STRING },
              recommendedFormat: {
                type: Type.STRING,
                description: "Must be 'gif', 'image', or 'both'",
              },
              formatRationale: { type: Type.STRING },
              searchQueries: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              suggestedCaptions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: ['emotion', 'humorCore', 'recommendedFormat', 'formatRationale', 'searchQueries', 'suggestedCaptions'],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return {
        scenario,
        emotion: parsed.emotion || 'Relatable irony',
        humorCore: parsed.humorCore || 'Expectations vs reality',
        recommendedFormat: (['gif', 'image', 'both'].includes(parsed.recommendedFormat) ? parsed.recommendedFormat : 'both') as any,
        formatRationale: parsed.formatRationale || 'Chosen based on emotional pacing.',
        searchQueries: Array.isArray(parsed.searchQueries) && parsed.searchQueries.length > 0 ? parsed.searchQueries : [scenario],
        suggestedCaptions: Array.isArray(parsed.suggestedCaptions) && parsed.suggestedCaptions.length > 0 ? parsed.suggestedCaptions : [scenario],
      };
    } catch (err) {
      console.error('Gemini scenario analysis error:', err);
      return {
        scenario,
        emotion: 'Relatable irony',
        humorCore: 'Everyday struggles and comic contrast',
        recommendedFormat: 'both',
        formatRationale: 'Both formats offer great comedic timing for this scenario.',
        searchQueries: [scenario, 'reaction meme', 'relatable reaction gif'],
        suggestedCaptions: [scenario],
      };
    }
  },

  // 2. Rank candidate memes against scenario and pick the funniest
  async rankCandidates(
    scenario: string,
    candidates: MemeItem[],
    recommendedFormat: string
  ): Promise<{ ranked: MemeItem[]; bestMatchIndex: number; rationale: string }> {
    if (candidates.length === 0) {
      return { ranked: [], bestMatchIndex: 0, rationale: 'No candidates available.' };
    }

    const ai = getGeminiClient();

    // Fallback ranking if Gemini is unavailable
    if (!ai) {
      const scored = candidates.map((c, i) => {
        let score = c.relevanceScore || 70;
        if (recommendedFormat === c.mediaType) score += 10;
        return { ...c, relevanceScore: Math.min(score, 98) };
      });
      scored.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
      return {
        ranked: scored,
        bestMatchIndex: 0,
        rationale: `Selected best visual match for "${scenario.slice(0, 35)}..." based on emotional tone and timing.`,
      };
    }

    try {
      const candidatesSummary = candidates.slice(0, 15).map((c, idx) => ({
        index: idx,
        caption: c.caption,
        type: c.mediaType,
        tags: c.tags,
        provider: c.provider,
      }));

      const prompt = `You are a meme curator and comedy expert.
The user entered this scenario: "${scenario}"
Recommended format preference: ${recommendedFormat}

Here are ${candidatesSummary.length} candidate memes/GIFs found online:
${JSON.stringify(candidatesSummary, null, 2)}

Rank these candidates for:
1. Relatability to the exact scenario.
2. Comedic timing and humor potential.
3. How natural the reaction or visual fits the situation.

Select the best candidate index (0-based) and assign relevance scores (0-100). Explain why the #1 choice is funny.`;

      const response = await ai.models.generateContent({
        model: TEXT_MODEL,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              bestIndex: { type: Type.INTEGER },
              explanation: { type: Type.STRING },
              rankedIndices: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    index: { type: Type.INTEGER },
                    score: { type: Type.INTEGER },
                    humorScore: { type: Type.INTEGER },
                  },
                  required: ['index', 'score'],
                },
              },
            },
            required: ['bestIndex', 'explanation', 'rankedIndices'],
          },
        },
      });

      const result = JSON.parse(response.text || '{}');
      const rankedIndices = result.rankedIndices || [];
      const scoreMap = new Map<number, { score: number; humorScore?: number }>();
      for (const item of rankedIndices) {
        scoreMap.set(item.index, { score: item.score, humorScore: item.humorScore });
      }

      const scoredList = candidates.map((c, idx) => {
        const info = scoreMap.get(idx);
        return {
          ...c,
          scenario,
          relevanceScore: info?.score ?? c.relevanceScore ?? 70,
          humorScore: info?.humorScore ?? 85,
          reasoning: idx === result.bestIndex ? result.explanation : c.reasoning,
        };
      });

      // Sort with highest relevance first
      scoredList.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));

      return {
        ranked: scoredList,
        bestMatchIndex: 0,
        rationale: result.explanation || 'Best semantic match for the emotional tone.',
      };
    } catch (err) {
      console.error('Candidate ranking error:', err);
      return {
        ranked: candidates,
        bestMatchIndex: 0,
        rationale: 'Ranked based on keyword correlation and format compatibility.',
      };
    }
  },

  // 3. Generate witty captions
  async generateCaptions(scenario: string, humorStyle = 'relatable', count = 5): Promise<string[]> {
    const ai = getGeminiClient();
    if (!ai) {
      return [
        `When ${scenario.toLowerCase()}`,
        'Me trying my best vs reality:',
        'Nobody:\nLiterally nobody:\nMe right now:',
        'There were attempts made.',
        'Brain: 404 Error Not Found',
      ];
    }

    try {
      const prompt = `Write ${count} hilarious, concise meme captions or punchlines for this scenario:
"${scenario}"
Humor style: ${humorStyle}

Rules:
- Keep them sharp, viral, and relatable (under 15 words each).
- Include different meme styles: "When you...", "Nobody:\nMe:", Top/Bottom text style, and sarcastic self-deprecating one-liners.
- Do not use hashtags or emojis in the punchlines.`;

      const response = await ai.models.generateContent({
        model: TEXT_MODEL,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              captions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: ['captions'],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return parsed.captions || [];
    } catch (err) {
      console.error('Caption generation error:', err);
      return [`When ${scenario}`, 'Me questioning all my life choices'];
    }
  },

  // 4. Generate original AI meme image
  async generateMemeImage(scenario: string, promptDetails?: string): Promise<{
    imageUrl?: string;
    caption: string;
    description: string;
  }> {
    const ai = getGeminiClient();

    // First generate a creative caption and detailed visual concept
    const captionPrompt = `You are a meme artist.
Scenario: "${scenario}"
Details: "${promptDetails || ''}"

Design an original viral meme visual:
1. Provide a funny punchline or caption.
2. Provide a descriptive image prompt for an image generator (e.g. style, subject, funny expression, lighting, background).`;

    let caption = `When ${scenario}`;
    let imagePrompt = `A funny expressive meme illustration depicting ${scenario}, vibrant comic pop art style, expressive facial reaction, humorous composition.`;

    if (ai) {
      try {
        const textRes = await ai.models.generateContent({
          model: TEXT_MODEL,
          contents: captionPrompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                caption: { type: Type.STRING },
                imagePrompt: { type: Type.STRING },
              },
              required: ['caption', 'imagePrompt'],
            },
          },
        });
        const parsed = JSON.parse(textRes.text || '{}');
        if (parsed.caption) caption = parsed.caption;
        if (parsed.imagePrompt) imagePrompt = parsed.imagePrompt;
      } catch (err) {
        console.error('Text planning error for meme generation:', err);
      }
    }

    // Try generating actual image using Gemini image model
    if (ai) {
      try {
        const imageRes = await ai.models.generateContent({
          model: IMAGE_MODEL,
          contents: {
            parts: [{ text: `${imagePrompt}. Meme style, sharp focus, funny reaction, clean lighting.` }],
          },
          config: {
            imageConfig: {
              aspectRatio: '1:1',
            },
          },
        });

        const candidates = imageRes.candidates;
        if (candidates && candidates[0]?.content?.parts) {
          for (const part of candidates[0].content.parts) {
            if (part.inlineData?.data) {
              const mime = part.inlineData.mimeType || 'image/png';
              return {
                imageUrl: `data:${mime};base64,${part.inlineData.data}`,
                caption,
                description: imagePrompt,
              };
            }
          }
        }
      } catch (err: any) {
        console.warn('Gemini image generation call notice:', err?.message || err);
        // If image model is restricted or needs paid tier, return description and fallback canvas template
      }
    }

    return {
      caption,
      description: imagePrompt,
    };
  },
};
