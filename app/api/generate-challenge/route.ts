import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

const AI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

export async function POST(req: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Missing Gemini API Key. Set GEMINI_API_KEY in your environment." },
        { status: 500 }
      );
    }

    const { history } = await req.json();
    const historyString = JSON.stringify(history || []);

    const prompt = `You are an AI relationship coach and creative companion for couples.
Here is a summary of some of the answers a couple has given in past relationship quizzes:
${historyString.substring(0, 5000)}

Based exclusively on their answers, their vibe, and what they seem to value or find funny, generate a single, highly creative, very personalized "Couple's Challenge" or "Relationship Prompt" for them to do today.
It should be fun, thoughtful, and reference their past answers loosely if possible. If there's no past history, just generate a really fun universal couple challenge.
Format the response cleanly in plain text or simple markdown. Do not include much preamble — start directly with the challenge. Keep it to max 3 paragraphs.`;

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: AI_MODEL,
      contents: prompt,
    });

    return NextResponse.json({ challenge: response.text });
  } catch (err: any) {
    console.error("generate-challenge error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}