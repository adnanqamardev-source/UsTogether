# Couple Connect

A real-time platform designed to bring couples closer together through interactive relationship quizzes, shared milestones, and a private chat interface.

**Live Demo:** [https://us-together-seven.vercel.app/](https://us-together-seven.vercel.app/)

## 📊 Current App Status

### ✅ Working Features
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

## ⚠️ Known Issues & Deployment Status

### Current Production Issue
If you encounter the following error on the **live published website**:
```
Firestore Error: {"error":"Missing or insufficient permissions.","operationType":"list","path":"sessions"}
```

**What is happening?**
The online published website is running a cached version of the frontend code. The studio code has been updated to query the correct nested Firestore path (`couples/${coupleId}/sessions`), but the deployment hasn't synced the latest changes yet.

**What has been fixed:**
- The frontend code now correctly queries nested paths (`couples/${coupleId}/sessions`) instead of the root `sessions` collection
- Firestore security rules are properly configured to enforce this structure
- Local development and preview modes work correctly

**What needs to be done:**
- Click the **Share / Publish** button in the AI Studio dashboard to redeploy and clear the cached version
- This will push the latest frontend code to the production environment

---

## 🚀 Deployment & Setup

To run or deploy this application:

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Firebase**
   - Set up the Firebase configuration (`firebase-applet-config.json`)

3. **Deploy Firestore Rules**
   ```bash
   firebase deploy --only firestore:rules
   ```

4. **Build the Application**
   ```bash
   npm run build
   ```

5. **Deploy to Production**
   - For Vercel: Push to the main branch to trigger auto-deployment
   - Make sure to republish through AI Studio if using Google AI Studio

---

## 📝 Notes for Contributors

This project is actively being developed. The main challenge currently is syncing the deployed version with the latest studio changes. Always test locally before committing changes that involve Firestore interactions.
