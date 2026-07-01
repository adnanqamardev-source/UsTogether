import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { getUserId } from "@/lib/api-auth";
import { validateChatBody, sanitizeText } from "@/lib/input-validation";
import { checkRateLimit } from "@/lib/ratelimit";

export const maxDuration = 30;

interface ChatMessage {
  role: string;
  text: string;
  timestamp?: string;
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateAllowed = await checkRateLimit(`chat:${userId}`, 12, 60_000);
    if (!rateAllowed) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    const raw = await req.json().catch(() => null);
    const parsed = validateChatBody(raw);
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const { messages, coupleId } = parsed;

    if (!process.env.GEMINI_API_KEY) {
      throw new Error("Missing Gemini API Key.");
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // 24-hour icebreaker logic: if last message is older than 24h, inject a desi icebreaker
    let systemInstruction = `You are a warm, playful Desi chat companion for couples. Keep replies short, sweet, and culturally warm — chai, samosa, monsoon drives, Bollywood references allowed. Stay friendly and helpful.`;

    const safeMessages = messages as ChatMessage[];
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
      ...safeMessages.map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: sanitizeText(m.text || "") }],
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
