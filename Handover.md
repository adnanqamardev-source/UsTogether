# Couple Connect - Developer Handover Document

## Current Implementation Status
The core foundation of the application has been set up, including:
1.  **Authentication**: Handled via Google Provider.
2.  **Couple Pairing**: A unique code system to pair two users into a `couples` Firestore document.
3.  **Real-Time Chat**: Nested message collection (`couples/{coupleId}/messages`) with real-time listeners.
4.  **Real-Time Quizzes (Sessions)**: Shared interactive sessions where partners answer relationship quizzes to earn points. **Fixed the synchronization issue** where the UI sometimes didn't accurately reflect "waiting for partner" status if one person answered a text question versus multiple choice. UI now uses strict `undefined` checks.
5.  **Robust Error Handling**: Standardized Firestore operation wrappers to trace permission failures and operation mismatches.

---

## ⚠️ Where I am Struggling / Important Bottleneck

**The Environment & Rule Sync Disconnect (The "sessions" List Error)**

You reported this specific error occurring on your published website:
`{"error":"Missing or insufficient permissions.","operationType":"list","path":"sessions"}`

**Why this is happening and why we struggled with it initially:**
1.  **Root vs. Nested Collections:** In early iterations of the code, queries were accidentally attempting to read a root-level collection literally named `sessions` (e.g., `collection(db, "sessions")`). 
2.  **Strict Security Rules:** Our deployed `firestore.rules` correctly enforces strict security, dictating that sessions must reside *under* the couple's document (`match /couples/{coupleId}/sessions/{sessionId}`). Therefore, the Firestore backend rejected the root-level read as unauthorized.
3.  **The Publishing Disconnect (The Real Issue):** We have **already fixed the source code** and the `firestore.rules` in this workspace. The path has been corrected to `couples/${coupleId}/sessions`. However, the reason it works inside the Gemini Studio (preview) but fails on the **Online Published Website** is because the published site is still serving an **older build** of the frontend JavaScript (the minified `page-[hash].js` mentioned in your error log) that contains the old bug.

**How to resolve this immediately:**
Since the fixes are complete in the codebase, you must forcefully trigger a **new deployment / republish** of your app to your hosting provider (or via the AI Studio Deploy button) to update the published frontend chunk to the corrected version.

---

## Google CLI / Firebase CLI & Google AI Studio Integration

You asked: *"Prepare For Google Cli and Can i integrate the google studio with it"*

Yes! Here is how everything connects outside of this preview mode:

1.  **Google CLI / Firebase CLI:** 
    Currently, the backend (Firestore, Auth) runs on Firebase. To manage this from your own terminal (Google CLI/gcloud or Firebase CLI), you use the Firebase CLI:
    `npm install -g firebase-tools`
    `firebase login`
    `firebase use <your-project-id>`
    `firebase deploy` (to deploy rules, functions, or hosting). 
    Your `firestore.rules` file is already prepped in the directory specifically for CLI deployment!

2.  **Google AI Studio Integration:**
    If you want to plug in generative AI features (like "Generate a random relationship quiz" using LLMs), this project natively supports **Google Gen AI SDK**. You can get an API key from [Google AI Studio](https://aistudio.google.com/) and drop it into a `.env.local` file:
    `GEMINI_API_KEY=your_key_here`
    This allows you to add features like AI-generated dating advice or dynamically generated quizzes. *Note: Server-side API calls are recommended for Gemini to keep your API key secure.*

---

## Next Steps / Backlog
-   **Deploy Frontend Update**: Republish the app so the changes to the `sessions` queries reflect on the live site.
-   **Add End-of-Quiz Sync**: Currently, sessions stay in "playing" mode until all questions are answered. An explicit finalization screen with score summaries needs refinement.
-   **Memory/Stats Screen**: Replace the placeholder links on the interface to actual historical session results and a photo memory board.
-   **UI Polish**: The UI utilizes Tailwind and Lucide icons currently; some animations could be upgraded to Framer Motion constraints.
