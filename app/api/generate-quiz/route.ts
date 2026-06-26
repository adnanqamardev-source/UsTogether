import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("Missing Gemini API Key. Please set GEMINI_API_KEY in your environment.");
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    let body: any = {};
    try {
      body = await req.json();
    } catch {}

    const recentTopics: string[] = Array.isArray(body.recentTopics) ? body.recentTopics.slice(0, 20) : [];
    const preferredCategory: string | undefined = body.preferredCategory;

    const categories = [
      "Food & Drink",
      "Travel",
      "Family Dynamics",
      "Wedding Traditions",
      "Festivals",
      "Money & UPI",
      "Daily Life / Jugaad",
      "Transport",
      "Relationships / Dating",
      "Food Habits",
      "Shopping & Bargaining",
      "Household"
    ];

    const selectedCategory = preferredCategory || categories[Math.floor(Math.random() * categories.length)];

    const recentTopicsText = recentTopics.length > 0
      ? `\n\nIMPORTANT: Do NOT generate topics related to these recently asked questions: ${recentTopics.join(", ")}. Create entirely new scenarios.`
      : "";

    const prompt = `You are a creative app generating fun relationship quizzes with a warm Desi heart.
Generate a completely new, unique, fun 5-question relationship quiz for a couple in the category: "${selectedCategory}".
Infuse authentic Indian cultural context — think chai tapri breaks, Delhi metro rides, joint family dynamics, wedding festivities, festival preparations, UPI payment moments, jugaad solutions, local train travels, street food debates, Bollywood references — but keep questions lighthearted and universally understandable for couples.

${recentTopicsText}

STRICT RULES:
- ONLY generate multiple-choice questions. NO text/open-ended questions.
- Each question must have exactly 4 options.
- Make questions couple-focused and relationship-relevant.
- Avoid cartoonish stereotypes; keep it natural and relatable.

Output format MUST be valid JSON matching this schema:
{
  "title": "A fun title here",
  "description": "A short, engaging description.",
  "questions": [
    {
      "type": "choice",
      "q": "Multiple choice question?",
      "options": ["Option A", "Option B", "Option C", "Option D"]
    }
  ]
}
Make sure exactly one JSON object is returned, with no markdown code blocks around it if possible, just the raw JSON or wrapped in \`\`\`json.`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          temperature: 0.8,
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              title: { type: "string" },
              description: { type: "string" },
              questions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    type: { type: "string", enum: ["choice"] },
                    q: { type: "string" },
                    options: { type: "array", items: { type: "string" } }
                  },
                  required: ["type", "q", "options"]
                }
              }
            },
            required: ["title", "description", "questions"]
          }
        }
    });

    const text = response.text || '';

    let parsed;
    try {
      const cleaned = text.replace(/\`\`\`json\n?/, '').replace(/\`\`\`\n?/, '');
      parsed = JSON.parse(cleaned);
    } catch (e) {
      throw new Error("Failed to parse AI response as JSON.");
    }

    if (!parsed.questions || !Array.isArray(parsed.questions) || parsed.questions.length === 0) {
      throw new Error("AI returned invalid quiz format.");
    }

    const questionIds = parsed.questions.map((_: any, idx: number) => Date.now() + idx);

    return NextResponse.json({
      ...parsed,
      questionIds,
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}