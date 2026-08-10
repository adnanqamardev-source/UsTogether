import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

// Configurable via env; default to a stable, widely-available Gemini model.
const AI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

export async function POST(req: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Missing Gemini API Key. Set GEMINI_API_KEY in your environment." },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: AI_MODEL,
      contents: generateRelationshipQuizPrompt(),
    });

    const text = response.text || "";
    let parsed;
    try {
      const cleaned = text.replace(/```json\n?/, "").replace(/```\n?/, "").trim();
      parsed = JSON.parse(cleaned);
      if (!parsed.title || !parsed.description || !Array.isArray(parsed.questions)) {
        throw new Error("Invalid response format from AI");
      }
    } catch (e: any) {
      throw new Error(`Failed to parse AI response as JSON: ${e.message}`);
    }

    return NextResponse.json(parsed);
  } catch (err: any) {
    console.error("generate-quiz error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to generate quiz" },
      { status: 500 }
    );
  }
}

function generateRelationshipQuizPrompt(): string {
  return `
Generate a fun, engaging relationship-building quiz with 5 questions that help couples connect deeper.

Requirements:
1. Warm, inviting title
2. Brief description
3. Exactly 5 questions mixing "choice" (multiple choice) and "text" (open-ended)
4. Simple, accessible English
5. Subtle Indian context where natural (chai, Indian cuisine, local experiences, etc.)
6. Focus on genuine connection, dreams, daily life, and mutual understanding
7. Do NOT include a "correct answer" for choice questions — questions are about the partner's preference, so answers are matched between partners, not scored against a key

Choice questions: provide 4 options. Text questions: open-ended.

Return ONLY a valid JSON object with this exact structure:
{
  "title": "Quiz Title",
  "description": "Brief description",
  "questions": [
    { "type": "choice", "q": "Question text", "options": ["Option A", "Option B", "Option C", "Option D"] },
    { "type": "text", "q": "Open-ended question text" }
  ]
}
Make sure the JSON is valid and parseable.`;
}