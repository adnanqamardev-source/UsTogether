# UsTogether ☁️

**UsTogether** is a real-time, interactive web application designed to help couples connect, communicate, and grow together. Built with a high-velocity, AI-leveraged architecture, the app features live chat, shared memory boards, and dynamic, AI-generated relationship quizzes.

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat&logo=next.js)
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

* **Frontend:** Next.js (App Router), React, Tailwind CSS, Framer Motion
* **Backend:** Firebase (Firestore, Auth), Serverless API Routes
* **AI Integration:** Google GenAI SDK (Gemini 1.5 Flash)
* **Testing:** Playwright (End-to-End Testing)

## 🏗️ Architecture & State Management

This project utilizes custom, strictly-typed React hooks (`useFirestoreCollection`, `useFirestoreDocument`) to manage real-time data streams efficiently. Database operations are optimized to prevent memory leaks and minimize read costs, utilizing atomic batched writes for complex state changes.

## 🚀 Getting Started

### Prerequisites
* Node.js (v18 or higher)
* A Firebase Project (with Firestore and Authentication enabled)
* A Google Gemini API Key

### Installation

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/yourusername/ustogether.git](https://github.com/yourusername/ustogether.git)
   cd ustogether
