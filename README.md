# Couple Connect

A real-time platform designed to bring couples closer together through interactive relationship quizzes, shared milestones, and a private chat interface.

## Features Currently Implemented
*   **Secure Authentication**: Easy login with Google accounts.
*   **Private Couple Pairing**: Share a randomly generated pairing code with your partner to link accounts.
*   **Live Chat**: A slide-out messaging drawer with real-time sync, enabling a private communication channel away from crowded messaging apps.
*   **Interactive Quizzes**: Answer insightful relationship questions. (e.g. "Future & Finances", "The Great Indian Shaadi Debate").
*   **Real-time Gaming Engine**: Status tracking so both users see the current question and finish the quiz together.

## Tech Stack
*   **Frontend**: Next.js (App Router), React, Tailwind CSS, Lucide Icons, Framer Motion.
*   **Backend & Live Sync**: Firebase Firestore.
*   **Authentication**: Firebase Auth (Google Provider).

---

## ⚠️ Known Issues / Where We Are Struggling

If you encounter the following error on the **online published website**:
`Firestore Error: {"error":"Missing or insufficient permissions.","operationType":"list","path":"sessions"}`

**What is happening?**
This is a symptom of a **desynchronized deployment**, which means we were struggling to figure out why the fixes made in the studio weren't appearing online. 

1.  Originally, the code tried to query a collection called `sessions` at the root of the database.
2.  Our strict Firestore security rules correctly denied this because `sessions` data is required to be safely nested under a couple's specific pairing profile (`couples/${coupleId}/sessions`) so that no one else can read your dating quizzes.
3.  **The Fix is Already Done:** The frontend code in the studio has been updated to query the nested `couples/${coupleId}/sessions` path, resolving the issue locally in the editor and preview.

**The Solution:**
The online published website is running an old, cached version of the frontend JavaScript. To fix this, you need to click the **Share / Publish** button securely again in your AI Studio dashboard to deploy the latest code chunk updates to the public internet servers.

---

## Deployment & Setup
To run or deploy this application:
1.  Ensure all NPM packages are installed (`npm install`).
2.  Set up the Firebase configuration (`firebase-applet-config.json`).
3.  Deploy Firetore rules utilizing the Firebase CLI (`firebase deploy --only firestore:rules`).
4.  Build the Next.js app natively (`npm run build`).
