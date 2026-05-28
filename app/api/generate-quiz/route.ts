import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;
export const dynamic = 'force-dynamic'; // Ensure the route runs dynamically for truly unique quizzes

// Configuration constants
const AI_MODEL = "gemini-3-flash-preview";
const QUIZ_TYPE = "relationship-building";

export async function POST(req: NextRequest) {
  try {
    // Validate environment
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("Missing Gemini API Key. Please set GEMINI_API_KEY in your environment.");
    }

    // Initialize AI client
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // Generate the prompt for relationship-building questions
    const prompt = generateRelationshipQuizPrompt();

    // Call the AI model
    const response = await ai.models.generateContent({
      model: AI_MODEL,
      contents: prompt,
    });

    const text = response.text || '';

    // Parse the AI response
    let parsed;
    try {
      // Clean up markdown wrapping if present
      const cleaned = text
        .replace(/```json\n?/, '')
        .replace(/```\n?/, '')
        .trim();
      
      parsed = JSON.parse(cleaned);
      
      // Validate the response structure
      if (!parsed.title || !parsed.description || !Array.isArray(parsed.questions)) {
        throw new Error("Invalid response format from AI");
      }
    } catch (e) {
      throw new Error(`Failed to parse AI response as JSON: ${e.message}`);
    }

    return NextResponse.json(parsed);
  } catch (err: any) {
    console.error(`Error in ${QUIZ_TYPE} quiz generation:`, err);
    
    // Return appropriate error response
    const statusCode = err.message.includes("API Key") ? 500 : 500;
    return NextResponse.json(
      { error: err.message || "Failed to generate quiz" },
      { status: statusCode }
    );
  }
}

/**
 * Generates a prompt for creating relationship-building questions
 * with subtle Indian context and simple English
 */
function generateRelationshipQuizPrompt(): string {
  return `
Generate a fun, engaging relationship-building quiz with 5 questions based on the principles of deep connection and understanding.

The quiz should:
1. Have a warm, inviting title
2. Include a brief description explaining the purpose
3. Contain exactly 5 questions that help couples/partners connect deeper
4. Mix question types: choice (multiple choice) and text (open-ended)
5. Keep English simple and accessible
6. Include subtle Indian context where natural (references to chai, Indian cuisine, Rupees, local experiences, etc.)
7. Avoid being overly dramatic or stereotypical
8. Focus on genuine connection, dreams, daily life, and mutual understanding

Question types to include:
- Choice questions: Provide 4 options (A, B, C, D) with correct answer index (0-3)
- Text questions: Open-ended questions for personal reflection

Return ONLY a valid JSON object with this exact structure:
{
  "title": "Quiz Title Here",
  "description": "Brief description of the quiz purpose",
  "questions": [
    {
      "type": "choice",
      "q": "Question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "a": 0
    },
    {
      "type": "text",
      "q": "Open-ended question text"
    }
    // ... exactly 5 questions total
  ]
}

Make sure the JSON is valid and can be parsed directly.
`;
}