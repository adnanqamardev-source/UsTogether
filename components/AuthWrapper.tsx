"use client";

import { useAuth } from './AuthProvider';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';

// Dynamically import Dashboard with loading state
const DashboardDynamic = dynamic(
  () => import('@/components/Dashboard').then(mod => mod.default),
  {
    loading: () => (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-indigo-600 rounded-xl shadow-lg shadow-rose-500/20 animate-pulse" />
      </div>
    ),
    ssr: false, // Don't SSR since it requires auth
  }
);

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading, signIn: authSignIn, logOut: authLogOut, dbUser } = useAuth();
  const [wrapperLoading, setWrapperLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const router = useRouter();

  // Use AuthProvider's loading state to manage wrapper loading
  useEffect(() => {
    if (!authLoading) {
      setWrapperLoading(false);
      setAuthenticated(!!user && !!dbUser);
    }
  }, [authLoading, user, dbUser]);

  const handleSignIn = async () => {
    try {
      await authSignIn();
      // AuthProvider will handle setting user and dbUser via onAuthStateChanged
    } catch (error) {
      console.error('Sign in error:', error);
      // Error will be handled by AuthProvider
    }
  };

  const handleSignOut = async () => {
    try {
      await authLogOut();
      setAuthenticated(false);
      router.refresh(); // Refresh the page to show sign-in state
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  if (wrapperLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-indigo-600 rounded-xl shadow-lg shadow-rose-500/20 animate-pulse" />
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="text-center space-y-8">
          <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-rose-500/20">
            <span className="font-bold text-xl text-white">U</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-serif italic tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#F8FAFC] to-indigo-200">
            How well do you know each other?
          </h1>
          <p className="text-lg md:text-xl text-indigo-200/80 max-w-2xl mx-auto font-light">
            Create personalized quizzes relevant to your journey together, compete on leaderboards, and share real-time memories with your partner.
          </p>
          <button
            onClick={handleSignIn}
            className="py-4 px-8 rounded-3xl bg-rose-500 text-white font-bold text-lg inline-flex items-center gap-3 hover:bg-rose-600 ring-2 ring-rose-500/50 ring-offset-4 ring-offset-[#0F0A1F] transition-all cursor-pointer"
          >
            Sign in to Connect
          </button>
        </div>
      </div>
    );
  }

  // User is authenticated, show the Dashboard component
  return <DashboardDynamic />;
}