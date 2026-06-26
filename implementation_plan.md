1. Current Work
Creating a hybrid static + AI quiz system for the UsTogether app. Deliver static JSON files with 300 Indian-context relationship questions (45-question sample first), add a type adapter, update QuizList.tsx to use a static fallback, and enhance the AI generation endpoint with context-awareness (recent history exclusion, dynamic cultural variables, category rotation, temperature tuning).

2. Key Technical Concepts
Static JSON data import in Next.js

Firestore document schema (Quiz, QuizQuestion)

TypeScript interfaces (StaticQuizQuestion, QuizQuestion)

React functional components with useState

MCQ multiple-choice rendering

Tailwind CSS styling

Firebase client SDK (getFirestore, collection, addDoc, onSnapshot)

Framer Motion (motion, AnimatePresence)

Lucide React icons

API route enhancement with request body parsing

3. Relevant Files and Code
global.d.ts

Current: Contains existing QuizQuestion interface: { q: string; type: 'text' | 'multiple'; options?: string[] }

Needs: StaticQuizQuestion interface added: { id: number; category: string; question: string; type: 'mcq'; options: string[]; text_fallback_allowed: boolean }

components/QuizList.tsx

Current: Fetches quizzes from Firestore collection 'quizzes' where isPublic == true. Has fetchNewQuiz() that POSTs to /api/generate-quiz and saves result to Firestore.

Needs: Modification to track and pass recentQTopics array to the API and fall back to static data when needed.

components/ActiveSession.tsx

Current: Renders quiz using question.q and question.options.

Needs: Ensure the adapter translates the static schema perfectly so this component requires zero changes.

app/api/generate-quiz/route.ts

Current: POST endpoint calling Google GenAI.

Needs: Accept body: { recentTopics?: string[], preferredCategory?: string }. Set temperature to 0.8, inject dynamic Indian cultural variables, rotate categories, and explicitly instruct "Do not generate topics related to..."

lib/firestore-helpers.ts

Current: Has getUserProfile, getCouple, getQuiz, batchWrite, etc.

components/QuizCard.tsx

Current: Displays quiz title/description, start button.

4. Problem Solving (The Strategy)
We want static questions as the base content (300 total, Indian cultural contexts like chai/coffee, local transit, family dynamics, wedding traditions) with AI as an add-on when static content runs out.

The AI endpoint must avoid generic outputs by:

Passing the recent 15-20 answered question topics to exclude them.

Injecting dynamic cultural scenarios (e.g., "Jaipur to Delhi sleeper train journey", "chaotic joint family wedding").

Rotating categories randomly if the user repeatedly clicks "Fetch New".

Setting temperature 0.8 for creativity while strictly enforcing JSON output mode.

🚨 5. Architectural Do's and Don'ts
DO's:

DO use the Adapter Pattern: Write a robust toFirestoreQuiz() adapter in lib/quiz-data.ts that safely maps StaticQuizQuestion fields to the existing QuizQuestion format. This protects ActiveSession.tsx from needing UI changes.

DO enforce strict JSON mode for AI: Because you are raising the LLM temperature to 0.8 for creativity, you must use Google GenAI's responseMimeType: "application/json" (or structured outputs) to prevent the schema from breaking.

DO prioritize batch operations: If creating a seed script to push the 300 static questions to Firestore, use Firebase writeBatch() to avoid hitting rate limits or causing excessive separate writes.

DO track question history: Keep a lightweight state array of recently answered question.ids or categories in the frontend (or fetched from Firestore) so you can pass them to the AI endpoint as recentTopics.

DO keep cultural context natural: Use relatable Indian contexts (e.g., jugaad, UPI payments, local transit, joint families) but avoid cartoonish stereotypes.

DON'Ts:

DON'T alter QuizQuestion in global.d.ts: Leave the existing interface exactly as it is. Only add the new StaticQuizQuestion interface. Modifying the old one could break legacy quizzes already stored in your database.

DON'T fetch all 300 JSON objects into memory at once on the client: If serving directly from Next.js, paginate the static JSON array or lazy-load it to keep the initial JS bundle small.

DON'T allow AI open-ended questions: Ensure your API route's system prompt explicitly bans type: "text" generation. It must strictly return the MCQ format.

DON'T block the UI while AI loads: AI generation takes 3-5 seconds. Ensure QuizList.tsx has a clear, non-blocking loading state (e.g., a skeleton loader or a spinner on the "Fetch New" button) while waiting for the AI response.

DON'T write static questions to Firestore on every load: Ensure your logic checks if the static questions already exist in the database before attempting to upload/seed them to save read/write costs.

6. Pending Tasks and Next Steps

[ ] Step 1: Add StaticQuizQuestion interface to global.d.ts.

[ ] Step 2: Create data/quiz-questions-sample.json (45 questions, first batch).

[ ] Step 3: Create data/quiz-questions.json (300 questions total).

[ ] Step 4: Create lib/quiz-data.ts with getStaticQuizQuestions, getSampleQuestions, and the toFirestoreQuiz adapter.

[ ] Step 5: Update QuizList.tsx to pass recent history to the API and handle the static data fallback logic.

[ ] Step 6: Update app/api/generate-quiz/route.ts for context-aware generation (history exclusion, category rotation, temperature).

[ ] Step 7: Verify JSON schema and rendering via existing e2e tests.