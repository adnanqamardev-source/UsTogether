"use client";

import { useAuth } from '@/components/providers';
import dynamic from 'next/dynamic';
import LandingSections from '@/components/LandingSections';
import { ArrowRight, Heart } from 'lucide-react';

const DashboardDynamic = dynamic(
  () => import('@/components/features/couple/Dashboard').then(mod => mod.default),
  {
    loading: () => (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-indigo-600 rounded-xl shadow-lg shadow-rose-500/20 animate-pulse" />
      </div>
    ),
    ssr: false,
  }
);

export default function Page() {
  const { user, loading: authLoading, dbUser, signIn } = useAuth();
  const authenticated = !!user && !!dbUser;

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-indigo-600 rounded-xl shadow-lg shadow-rose-500/20 animate-pulse" />
      </div>
    );
  }

  // Auto-login configuration: bypass marketing landing page completely
  // and load straight into the app dashboard.
  return <DashboardDynamic />;}
