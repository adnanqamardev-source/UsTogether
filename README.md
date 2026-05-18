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

### ⚠️ Critical Issues & Active Development

#### 🔴 Critical Issues
- **Quiz Sync Not Working Properly** - Sessions fail to synchronize between partners during quiz completion. Points calculation may not persist correctly.
- **Homepage Feels Bland & Empty** - Lacks visual appeal, engaging hero section, and user engagement elements.
- **UI Needs Polish** - Dashboard appears plain, missing visual hierarchy and animations.

#### 🟡 Missing Features
- **Memory/Gallery Feature** - No way to store or view couple memories, photos, or shared moments.
- **Chat Implementation Incomplete** - Basic messaging exists but lacks proper UI, message history, typing indicators, and read receipts.
- **Stats/Leaderboard** - No way to track couple scores or progress over time.

## Tech Stack
*   **Frontend**: Next.js (App Router), React, Tailwind CSS, Lucide Icons, Framer Motion.
*   **Backend & Live Sync**: Firebase Firestore.
*   **Authentication**: Firebase Auth (Google Provider).

---

## ⚠️ Production Deployment Issue

### Firestore Permissions Error
If you encounter the following error on the **live published website**:
```
Firestore Error: {"error":"Missing or insufficient permissions.","operationType":"list","path":"sessions"}
```

**Status**: The code has been fixed locally. The online version is running a cached/outdated deployment.

**What's been fixed:**
- Frontend code now correctly queries nested paths (`couples/${coupleId}/sessions`)
- Firestore security rules are properly configured
- Local development and preview modes work correctly

**What needs to be done:**
- Click the **Share / Publish** button in the AI Studio dashboard to redeploy with the latest code
- This will clear the cached version and push the corrected frontend to production

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
   - For AI Studio: Click **Share / Publish** button to redeploy

---

## 📝 Notes for Contributors

This project is actively being developed with focus on:
1. Fixing quiz synchronization between partners
2. Redesigning the homepage and dashboard UI
3. Implementing memory/gallery features
4. Enhancing chat functionality

Always test locally before committing changes, especially those involving Firestore interactions and real-time synchronization.

See `Goals.md` for the full roadmap and priority issues.
