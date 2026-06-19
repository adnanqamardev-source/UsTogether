import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const { messages, coupleId } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      throw new Error("Missing Gemini API Key.");
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // 24-hour icebreaker logic: if last message is older than 24h, inject a desi icebreaker
    let systemInstruction = `You are a warm, playful Desi chat companion for couples. Keep replies short, sweet, and culturally warm — chai, samosa, monsoon drives, Bollywood references allowed. Stay friendly and helpful.`;

    const safeMessages: any[] = Array.isArray(messages) ? messages : [];
    const last = safeMessages[safeMessages.length - 1];
    let injectedIcebreaker: string | null = null;

    if (last?.timestamp) {
      const lastTs = new Date(last.timestamp).getTime();
      const now = Date.now();
      if (!Number.isNaN(lastTs) && now - lastTs > 24 * 60 * 60 * 1000) {
        injectedIcebreaker = "It's been a little while — start with a warm, cheeky desi icebreaker to bring the smile back.";
      }
    }

    const contents = [
      { role: "user", parts: [{ text: systemInstruction + (injectedIcebreaker ? "\n\n" + injectedIcebreaker : "") }] },
      ...safeMessages.map((m: any) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.text || "" }],
      })),
    ];

    if (safeMessages.length === 0 && injectedIcebreaker) {
      contents[0].parts[0].text += "\n\n" + injectedIcebreaker;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents,
    });

    return NextResponse.json({ reply: response.text || "" });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}