# Product Requirements Document — UsTogether

**Version:** 1.1  
**Date:** 2026-07-04  
**Status:** Active — Post-Audit

---

## 1. Problem Statement

Couples today lack dedicated digital spaces designed exclusively for their relationship. Existing communication tools (texting, social media, shared calendars) were not built for the unique needs of romantic partnerships. Couples struggle to:

- **Maintain connection** amid busy schedules and daily distractions
- **Create shared memories** in an organized, meaningful way
- **Grow together** through intentional activities and challenges
- **Track relationship milestones** and celebrate progress

The problem is not a lack of communication tools — it's the absence of a **relationship-focused platform** that combines real-time connection, shared experiences, and personal growth in one place.

---

## 2. Target Users

**Primary Users:** Couples aged 22–40, tech-comfortable, in committed relationships (dating, engaged, or married).

**User Personas:**

1. **The Busy Professional Couple**
   - Age: 28–35
   - Both partners have demanding careers
   - Tech-savvy, use multiple apps daily
   - Pain point: Hard to find quality time; want structured ways to connect despite busy schedules

2. **The Long-Distance Couple**
   - Age: 22–30
   - Temporarily separated by work, school, or family
   - Heavy users of video calls and messaging
   - Pain point: Need more meaningful interactions beyond casual texting; want to feel close despite distance

3. **The Newlywed / New Couple**
   - Age: 22–28
   - Excited about building a life together
   - High motivation to create traditions and memories
   - Pain point: Don't want to lose the "spark"; want tools to intentionally strengthen their bond

**Frustrations with current solutions:**

- Generic messaging apps lack relationship context
- Social media creates performative sharing instead of genuine connection
- No unified space for quizzes, memories, chat, and milestones
- Existing "couple apps" are often gimmicky or superficial

---

## 3. Product Vision

**UsTogether** is the **digital relationship hub** that helps couples strengthen their bond through intentional, fun, and meaningful interactions — all in one place.

We're not building another chat app. We're building a **relationship OS** that combines:

- Real-time connection (chat)
- Shared growth (quizzes & challenges)
- Memory keeping (memory boards & streaks)
- Gamification (achievements & points)

**North Star Metric:** Weekly active couples — couples who return at least once per week to engage with at least two features (chat + quiz OR chat + memory board).

---

## 4. Core Features

### Must-Have (MVP) — ✅ All Implemented

| Feature | Description | Priority | Status |
|---------|-------------|----------|--------|
| **User Authentication** | Google OAuth login; secure, one-click sign-in | Must-Have | ✅ Live |
| **Partner Pairing** | Couples link accounts via secure pairing code; one-to-one matching | Must-Have | ✅ Live |
| **Real-Time Chat** | Live messaging between partners with optimistic UI, typing indicators, auto-scroll | Must-Have | ✅ Live |
| **AI-Powered Quizzes** | Google Gemini 2.5 Flash generates personalized relationship questions on-demand | Must-Have | ✅ Live |
| **Quiz Sessions** | Real-time synchronized quiz gameplay between both partners | Must-Have | ✅ Live |
| **Points System** | Couples earn points for completing quizzes together | Must-Have | ✅ Live |
| **User Profiles** | Basic profile with display name, email, points, streak, and status | Must-Have | ✅ Live |
| **Responsive Design** | Works on mobile, tablet, and desktop | Must-Have | ✅ Live |

### Nice-to-Have — Implemented (Promoted from Post-MVP)

| Feature | Description | Priority | Status |
|---------|-------------|----------|--------|
| **Streak Tracking** | Daily activity streaks with animated counter and progress bar | Nice-to-Have | ✅ Live |
| **Achievements System** | 8 badges across 4 categories (participation, streak, milestone, social) | Nice-to-Have | ✅ Live |
| **Memory Board** | Quiz history display with AI-generated couple challenges | Nice-to-Have | ✅ Live |
| **Stats Page** | Dedicated analytics page with 30-day activity heatmap and metrics | Nice-to-Have | ✅ Live |
| **AI Challenge Generation** | Gemini-powered couple challenges based on quiz history | Nice-to-Have | ✅ Live |

### Nice-to-Have (Post-MVP) — Not Yet Implemented

| Feature | Description | Priority |
|---------|-------------|----------|
| **Photo Gallery Upload** | Upload and share photos in memory board | Nice-to-Have |
| **Milestone Timeline** | Visual timeline of relationship milestones | Nice-to-Have |
| **Bucket List** | Couple goals and activities to complete together | Nice-to-Have |
| **Social Sharing** | Share achievements or milestones to external social platforms | Nice-to-Have |
| **Custom Challenges** | User-generated challenges and quizzes | Nice-to-Have |
| **Leaderboards** | Compare couple scores with other pairs (anonymized) | Nice-to-Have |
| **Dark/Light Mode Toggle** | User preference for theme | Nice-to-Have |
| **Push Notifications** | Reminders for daily quizzes or unread messages | Nice-to-Have |
| **Multiple Languages** | Internationalization support | Nice-to-Have |

---

## 5. App Flow

### 5.1 Landing / Login Flow

1. **User lands on homepage** → Sees branded landing page with value proposition
2. **User clicks "Sign In"** → Redirected to Google OAuth flow
3. **User authenticates** → Firebase creates user profile (first-time) OR loads existing profile
4. **System checks pairing status**:
   - **Not paired:** User sees "Invite your partner" screen with unique pairing code
   - **Already paired:** User redirected to dashboard

### 5.2 Pairing Flow

1. **User A generates pairing code** → Copyable link or 6-character code
2. **User A shares code** → Via text, email, or social media
3. **User B clicks link / enters code** → Triggers pairing request
4. **System validates** → Both users confirmed; couple record created in Firestore
5. **Success state** → Both users redirected to dashboard; real-time connection established

### 5.3 Dashboard Flow

1. **Both partners land on dashboard** → See couple greeting, streak counter, and quick actions
2. **Features accessible:**
   - Start new quiz session
   - Open live chat
   - View memory board
   - Check achievements
3. **Real-time sync** → Partner activities (chat messages, quiz answers) appear instantly

### 5.4 Quiz Flow

1. **User A initiates quiz** → Selects "AI Quiz" or "Custom Quiz"
2. **System generates questions** → AI creates relationship-focused questions OR loads from quiz library
3. **Session created** → Firestore document stored at `couples/{coupleId}/sessions/{sessionId}`
4. **Partner notification** → User B sees "Quiz invite" in dashboard
5. **Both users join** → Real-time sync begins
6. **Question display** → One question at a time; both answers visible after submission
7. **Answer submission** → Points awarded; scores tracked in real-time
8. **Session completion** → Final tally displayed; achievements checked; results saved to session history

### 5.5 Chat Flow

1. **User opens chat drawer** → Smooth slide-in animation from right
2. **Message composition** → Text input with send button (Enter key supported)
3. **Optimistic UI** → Message appears immediately in chat stream
4. **Real-time sync** → Firestore listener pushes new messages to both partners
5. **Auto-scroll** → If user is at bottom, scroll to newest message; otherwise show "new messages" indicator
6. **Persistent history** → All messages stored in `couples/{coupleId}/messages/{messageId}`

### 5.6 Logout Flow

1. **User clicks avatar/logout** → Confirmation dialog
2. **Session cleared** → Firebase auth signout
3. **Return to homepage** → Landing page displayed

---

## 6. Success Metrics

### Primary Metrics

1. **Weekly Active Couples (WAC)**
   - Definition: Couples who engage with at least 2 features in a 7-day window
   - Target: 500 WAC within first month of public launch
   - Measurement: Firestore sessions + chat + memory board activity

2. **Partner Pairing Completion Rate**
   - Definition: % of users who complete pairing after first login
   - Target: > 60%
   - Measurement: Users with `pairedCoupleId` / total new signups

3. **Session Completion Rate**
   - Definition: % of quiz sessions started that reach "finished" status
   - Target: > 70%
   - Measurement: `status === "finished"` count / `status === "playing"` count

4. **Weekly Quiz Completion**
   - Definition: Average number of quizzes completed per couple per week
   - Target: 3+
   - Measurement: Sessions with status "finished" per couple per week

### Secondary Metrics

5. **Chat Message Volume**
   - Definition: Average messages per couple per day
   - Target: 20+
   - Indicator of engagement and relationship activity

6. **Day-7 Retention**
   - Definition: % of users who return 7 days after first login
   - Target: > 40%
   - Measurement: Auth analytics + Firestore `lastActiveDate`

7. **Net Promoter Score (NPS)**
   - Definition: "How likely are you to recommend UsTogether to a friend?"
   - Target: 50+
   - Measured via in-app survey (post-MVP)

### Guardrail Metrics

- **API Latency** — AI quiz generation P95 < 3s
- **Chat Message Delivery** — P95 < 500ms
- **Error Rate** — < 1% of API requests fail
- **Firestore Read Costs** — Keep average reads per session under 50 to control costs

---

## 7. MVP Scope

**MVP Launch Date Target:** 8 weeks from project kickoff

**MVP Includes (✅ All Implemented):**

- Google OAuth authentication
- One-to-one partner pairing via code
- Real-time chat with optimistic UI and typing indicators
- AI-generated quizzes with real-time sync (Gemini 2.5 Flash)
- Points system
- Streak tracking with animated counter
- Achievements system (8 badges, 4 categories)
- Memory board (quiz history + AI challenges)
- Stats page with activity heatmap
- Responsive web design (mobile + desktop)
- Dark theme (brand standard)

**MVP Excludes (Still Not Implemented):**

- Photo gallery uploads
- Milestone timeline
- Custom quiz creation
- Social sharing
- Push notifications
- Multi-language support
- Admin panel or user management UI
- Leaderboards
- Bucket list

---

## 8. Out of Scope (Version 1.0+)

The following features are **deliberately excluded** from the initial launch to maintain focus and velocity:

- **Video/Audio Calling:** Complex infrastructure; chat is sufficient for MVP
- **Group Sessions:** Multiple couples; focus on 1:1 experience first
- **Premium Subscriptions:** Monetization deferred until product-market fit
- **Mobile Native Apps:** Web app only (PWA considerations post-MVP)
- **AI Chatbot Companion:** Only AI-generated quizzes; no general-purpose chatbot
- **Calendar Integration:** No Google Calendar / iCal sync
- **Gift Registry / Date Planning:** Outside core loop

---

## 9. User Stories

**As a user, I want to:**
- Log in with one click so I don't have to manage another password
- Pair with my partner securely so we have a private space
- Chat in real-time so we feel connected throughout the day
- Take fun, relationship-focused quizzes so we learn more about each other
- See our points and track progress so we feel a sense of accomplishment
- Use the app on my phone so I can stay connected anywhere

**As a couple, we want to:**
- Have a dedicated space to communicate that feels special, not generic
- Engage in activities designed for our relationship, not solo apps
- Build shared memories and streaks together
- Feel closer despite busy schedules or distance

---

## 10. Competitive Landscape

**Direct Competitors:**
- **Coupled:** Relationship advice and quizzes; limited real-time features
- **Lasting:** Marriage coaching app; quiz-based but not interactive
- **Love Nudge:** Behavioral reminders; lacks real-time connection tools

**UsTogether Differentiation:**
- Real-time multiplayer quizzes (not just solo quizzes)
- Unified platform (chat + quizzes + memories) vs. single-feature apps
- AI-generated content (Gemini) for infinite variety
- Gamification that rewards *joint* activity, not individual use
- Privacy-first architecture (isolated couple data, no social graph)

---

## 11. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Gemini API quota exhaustion | Medium | High | Implement rate limiting (12 req/min per user); cache challenge responses (24h TTL) |
| Firestore cost overruns | Medium | High | Optimize queries; use efficient listeners; set budget alerts |
| Low pairing completion rate | Medium | Medium | Simplify onboarding; add in-app walkthrough; reduce friction |
| Chat moderation concerns | Low | Medium | Keep messages private between partners; implement keyword filter for safety |
| Tech stack complexity | Low | Medium | Keep architecture simple; avoid over-engineering; use managed services |

---

## 12. Appendix: Definitions

- **Couple:** Two users who have successfully completed the pairing flow
- **Session:** A single quiz or minigame instance between a couple
- **Pairing Code:** Unique identifier used to link two user accounts
- **Optimistic UI:** UI updates immediately before server confirmation
- **Firestore Listener:** Real-time data subscription to Firestore documents