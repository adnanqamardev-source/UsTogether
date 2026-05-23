import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from "next/server";
import { unstable_cache } from "next/cache";

export const maxDuration = 60;

// Cache the AI challenge generation to reduce API costs and latency.
// Cache key includes a hash of the history to serve cached results for identical requests.
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

    const prompt = `You are an AI relationship coach and creative companion for couples.
Here is a summary of some of the answers a couple has given in past relationship quizzes:
${JSON.stringify(history).substring(0, 5000)}

Based exclusively on their answers, their vibe, and what they seem to value or find funny, generate a single, highly creative, very personalized "Couple's Challenge" or "Relationship Prompt" for them to do today.
It should be fun, thoughtful, and reference their past answers loosely if possible (if they have past answers). If there's no past history, just generate a really fun universal couple challenge.
Format the response cleanly in plain text or simple markdown. Do not include too much preamble. Start directly with the challenge or prompt. Keep it to max 3 paragraphs.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    return response.text;
  },
  ['challenge-generation-cache'],
  { revalidate: 86400, tags: ['challenge'] } // Cache for 24 hours
);

export async function POST(req: NextRequest) {
  try {
    const { history } = await req.json();
    const historyString = JSON.stringify(history || []);
    const challenge = await getCachedChallenge(historyString);
    return NextResponse.json({ challenge });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}