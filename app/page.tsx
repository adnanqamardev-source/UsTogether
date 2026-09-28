"use client";

import { useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useAuth } from '@/components/providers';
import LandingSections from '@/components/LandingSections';

const DashboardDynamic = dynamic(
  () => import('@/components/features/couple/Dashboard').then((mod) => mod.default),
  {
    loading: () => (
      <div className="min-h-screen flex items-center justify-center bg-onyx">
        <div className="h-12 w-12 animate-pulse rounded-xl bg-gradient-to-br from-[#bcabae] to-[#716969] shadow-lg shadow-[#bcabae]/30" />
      </div>
    ),
    ssr: false,
  }
);

export default function Page() {
  const { user, loading: authLoading, dbUser, signIn } = useAuth();
  const authenticated = !!user && !!dbUser;

  const handleGetStarted = useCallback(async () => {
    try {
      await signIn();
    } catch (error) {
      console.error('Sign in error:', error);
    }
  }, [signIn]);

  if (authLoading || (user && !dbUser)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-onyx">
        <div className="h-12 w-12 animate-pulse rounded-xl bg-gradient-to-br from-[#bcabae] to-[#716969] shadow-lg shadow-[#bcabae]/30" />
      </div>
    );
  }

  if (authenticated) {
    return <DashboardDynamic />;
  }

  return <LandingSections onGetStarted={handleGetStarted} />;
}
