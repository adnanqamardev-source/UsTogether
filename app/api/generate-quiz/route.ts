import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "Missing Gemini API Key. Please set GEMINI_API_KEY in your environment." }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const prompt = `You are a creative app generating fun relationship quizzes.
Generate a completely new, unique, fun 5-question relationship quiz for a couple. Include a mix of multiple choice and text questions.
Output format MUST be valid JSON matching this schema:
{
  "title": "A fun title here",
  "description": "A short, engaging description.",
  "questions": [
    {
      "type": "text",
      "q": "Thoughtful text question?"
    },
    {
      "type": "choice",
      "q": "Multiple choice question?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "a": 1 // (optional, index of default correct or expected fun answer if there's one, else random 0-3)
    }
  ]
}
Make sure exactly one JSON object is returned, with no markdown code blocks around it if possible, just the raw JSON or wrapped in \`\`\`json.`;

    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
    });

    const text = response.text || '';
    
    let parsed;
    try {
      // Clean up markdown wrapping if present
      const cleaned = text.replace(/```json\n?/, '').replace(/```\n?/, '');
      parsed = JSON.parse(cleaned);
    } catch (e) {
      return NextResponse.json({ error: "Failed to parse AI response as JSON." }, { status: 500 });
    }

    return NextResponse.json(parsed);
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
