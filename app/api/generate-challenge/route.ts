import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { streamText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

export const maxDuration = 60;

// Cache the AI challenge generation to reduce API costs and latency.
const getCachedChallenge = unstable_cache(
  async (historyString: string) => {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("Missing Gemini API Key. Please set GEMINI_API_KEY in your environment.");
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    let history;
    try {
      history = JSON.parse(historyString);
    } catch {
      history = [];
    }

    const prompt = `You are a warm, playful Desi relationship coach for couples.
Based on their past quiz answers, vibe, and quirks, craft a single, creative "Couple's Challenge" for today. Sprinkle in Desi warmth — chai evenings, monsoon drives, samosa runs, Bollywood song dedications, Delhi metro adventures — while keeping it fun and easy to act on.
Return only the challenge text, max 3 short paragraphs.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            challenge: { type: "string" }
          },
          required: ["challenge"]
        }
      }
    });

    const text = response.text || '';
    let parsed;
    try {
      const cleaned = text.replace(/```json\n?/, '').replace(/```\n?/, '');
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = { challenge: text };
    }
    return parsed.challenge;
  },
  ['challenge-generation-cache'],
  { revalidate: 86400, tags: ['challenge'] }
);

export async function POST(req: NextRequest) {
  try {
    const { history } = await req.json();
    const summarized = (history || []).slice(-5).map((s: any) => s.quizTitle || s.title || 'unknown').join(', ');
    const challenge = await getCachedChallenge(summarized);
    return NextResponse.json({ challenge });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const history = searchParams.get('history') || '[]';
    const historyString = JSON.stringify(JSON.parse(history));

    const google = createGoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY });

    const result = streamText({
      model: google('gemini-3-flash-preview'),
      prompt: `You are a warm, playful Desi relationship coach for couples.
Based on their past quiz answers, vibe, and quirks, craft a single, creative "Couple's Challenge" for today. Sprinkle in Desi warmth — chai evenings, monsoon drives, samosa runs, Bollywood song dedications, Delhi metro adventures — while keeping it fun and easy to act on.
Return only the challenge text, max 3 short paragraphs.`,
      maxOutputTokens: 600,
    });

    return result.toTextStreamResponse();
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}