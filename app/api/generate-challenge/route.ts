import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { history } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "Missing Gemini API Key. Please set GEMINI_API_KEY in your environment." }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
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

    return NextResponse.json({ challenge: response.text });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
