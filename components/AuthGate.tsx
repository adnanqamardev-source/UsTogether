"use client";

import { useAuth } from "./AuthProvider";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/Button";

// Dashboard is heavy (Firebase + real-time listeners); defer its bundle.
const Dashboard = dynamic(
  () => import("@/components/Dashboard").then((m) => m.default),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 bg-ink text-canvas rounded-md flex items-center justify-center text-lg animate-pulse">
            U
          </div>
        </div>
      </div>
    ),
  }
);

/**
 * Thin gate that maps auth state to UI.
 * AuthProvider owns all auth logic — this component only decides what to render.
 */
export default function AuthGate() {
  const { user, loading, signIn } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 bg-ink text-canvas rounded-md flex items-center justify-center text-lg animate-pulse">
          U
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-xl w-full text-center flex flex-col items-center gap-8">
          <div className="w-14 h-14 bg-ink text-canvas rounded-md flex items-center justify-center text-xl font-bold">
            U
          </div>
          <h1 className="text-5xl md:text-6xl font-light tracking-tight leading-tight">
            How well do you know each other?
          </h1>
          <p className="text-xl font-light text-ink/70 max-w-md">
            Create personalized quizzes, compete on leaderboards, and share real-time
            memories with your partner.
          </p>
          <Button onClick={signIn}>Sign in to Connect</Button>
        </div>
      </div>
    );
  }

  // Authenticated — show the dashboard (pairing or couple view).
  return <Dashboard />;
}