import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from "next/server";
import { unstable_cache } from "next/cache";

export const maxDuration = 60;

// Cache the AI quiz generation to reduce API costs and latency.
// The prompt is static, so we can safely cache the response.
const getCachedQuiz = unstable_cache(
  async () => {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("Missing Gemini API Key. Please set GEMINI_API_KEY in your environment.");
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const prompt = `You are a creative app generating fun relationship quizzes with a warm Desi heart.
Generate a completely new, unique, fun 5-question relationship quiz for a couple. Include a mix of multiple choice and text questions. Infuse light Desi flavour into settings or phrasing — chai breaks, Delhi winters, auto rickshaw rides, Bollywood references, street-food debates — but keep questions universally understandable.

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
        config: {
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
                    type: { type: "string", enum: ["text", "choice"] },
                    q: { type: "string" },
                    options: { type: "array", items: { type: "string" } },
                    a: { type: "number" }
                  },
                  required: ["type", "q"]
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
      // Clean up markdown wrapping if present
      const cleaned = text.replace(/\`\`\`json\n?/, '').replace(/\`\`\`\n?/, '');
      parsed = JSON.parse(cleaned);
    } catch (e) {
      throw new Error("Failed to parse AI response as JSON.");
    }

    return parsed;
  },
  ['quiz-generation-cache'],
  { revalidate: 3600, tags: ['quiz'] } // Cache for 1 hour
);

export async function POST(req: NextRequest) {
  try {
    const parsed = await getCachedQuiz();
    return NextResponse.json(parsed);
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
