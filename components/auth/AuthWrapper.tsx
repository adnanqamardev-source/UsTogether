"use client";

import { useAuth } from '@/components/providers';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';

// Dynamically import Dashboard with loading state
const DashboardDynamic = dynamic(
  () => import('@/components/features/couple/Dashboard').then(mod => mod.default),
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

  // Auto-login configuration: ignore 'authenticated' state, skip returning login prompt entirely.
  // We go straight to Dashboard content
  return <DashboardDynamic />;}