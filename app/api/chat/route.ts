import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { getUserId } from "@/lib/api-auth";
import { validateChatBody } from "@/lib/input-validation";
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

    if (!(await checkRateLimit(`chat:${userId}`, 12, 60_000))) {
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

    const role = (r: string) => (r === "assistant" ? "model" : "user");

    const contents = [
      { role: "user", parts: [{ text: systemInstruction }] },
      ...safeMessages
        .filter((m) => m.text && m.text.trim().length > 0)
        .map((m) => ({
          role: role(m.role),
          parts: [{ text: m.text.slice(0, 2000) }],
        })),
    ];

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents,
    });

    return NextResponse.json({ reply: response.text || "" });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
