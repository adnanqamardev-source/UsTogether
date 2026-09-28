# UsTogether ☁️

**UsTogether** is a collaborative, real-time platform designed specifically for couples to strengthen their relationship through shared activities, communication, and digital memory-keeping. Built with a high-velocity, AI-leveraged architecture, the app features live chat, shared memory boards, and dynamic, AI-generated relationship quizzes.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat&logo=next.js)
![React](https://img.shields.io/badge/React-18-blue?style=flat&logo=react)
![Firebase](https://img.shields.io/badge/Firebase-Realtime-FFCA28?style=flat&logo=firebase)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?style=flat&logo=typescript)
![Google Gemini](https://img.shields.io/badge/AI-Google_Gemini-4285F4?style=flat&logo=google)

## ✨ Features

* **AI-Powered Quizzes:** Dynamic, personalized relationship challenges generated in real-time using Google Gemini, featuring strict JSON schema validation for UI resilience.
* **Real-Time Live Chat:** Seamless messaging with optimistic UI updates and auto-scrolling, backed by Firebase Firestore.
* **Shared Memory Boards:** A collaborative space to log milestones, check off bucket list items, and track your relationship streak.
* **Gamification & Achievements:** Earn points and unlock custom achievements as you interact and complete challenges together.
* **Secure Partner Pairing:** A robust, atomic pairing/unpairing flow utilizing Firestore batched writes to ensure data integrity and strict PII isolation.

## 🛠️ Tech Stack

* **Frontend:** Next.js (App Router), React, Tailwind CSS v4 (`@theme` tokens in `app/globals.css`), Motion (Framer Motion successor)
* **Backend:** Firebase (Firestore, Auth, Storage), Serverless API Routes
* **AI Integration:** Google GenAI SDK (Gemini 2.5 Flash for quizzes)
* **Testing:** Playwright (End-to-End Testing, 91 specs), Vitest (Unit Testing)

## 🎨 Design System

Palette lives in `app/globals.css` via Tailwind v4 `@theme` — that file is canonical, not any doc:

| Token | Hex | Usage |
|-------|-----|-------|
| `lilac-ash` | `#bcabae` | Primary accent, active states, CTAs |
| `onyx` | `#0f0f0f` | Page background |
| `graphite` | `#2d2e2e` | Cards, elevated surfaces |
| `dim-grey` | `#716969` | Muted text, placeholders |
| `white` | `#fbfbfb` | Primary text (overrides Tailwind `white`) |

Shared primitives live in `components/ui/` (`button`, `card`, `input`, `badge`, `empty-state`); layout in `components/layout/`; features in `components/features/` (thin re-export shims remain at `components/*.tsx` for compatibility).

## 🚀 Getting Started

### Prerequisites
* Node.js (v20 or higher)
* A Firebase Project (with Firestore and Authentication enabled)
* A Google Gemini API Key

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/adnanqamardev-source/UsTogether.git
   cd UsTogether
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env.local` file with your Firebase and Gemini credentials:
   ```bash
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Visit [http://localhost:3000](http://localhost:3000) to see the app in action.

### Available Scripts

* `npm run dev` - Start development server
* `npm run build` - Build for production
* `npm run start` - Start production server
* `npm run lint` - Run ESLint
* `npm run test:unit` - Run unit tests with Vitest
* `npm run test:e2e` - Run end-to-end tests with Playwright (requires `NEXT_PUBLIC_DEMO_MODE=true`)

## 📚 Documentation

* **[PRD.md](PRD.md)** - Product Requirements Document with user stories, metrics, and feature scope
* **[TECHNICAL_ARCHITECTURE.md](TECHNICAL_ARCHITECTURE.md)** - System architecture and data models
* **[FRONTEND_SPEC.md](FRONTEND_SPEC.md)** - UI/UX specifications and component guidelines
* **[FEATURE_TICKETS.md](FEATURE_TICKETS.md)** - Development tickets and implementation plan
* **[FEATURE_SCOPE.md](FEATURE_SCOPE.md)** - Feature prioritization and roadmap
* **[CONTEXT.md](CONTEXT.md)** - Domain model, load-bearing invariants, and known divergences (bugs)
* **[SECURITY_AND_ACCESS.md](SECURITY_AND_ACCESS.md)** - Auth, Firestore rules policy, rate limiting

## 🔐 Security

All user data is isolated at the couple level with strict Firestore security rules. See [SECURITY_AND_ACCESS.md](SECURITY_AND_ACCESS.md) for details.

## 📱 Deployment

The app is designed to be deployed on Vercel with Firebase as the backend. Ensure all environment variables are set in your deployment platform.

## 📄 License

This project is licensed under the terms specified in [LICENSE](LICENSE).
