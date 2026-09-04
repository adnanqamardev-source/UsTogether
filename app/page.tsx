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

  if (authenticated) {
    return <DashboardDynamic />;
  }

  return (
    <div className="flex-1 flex flex-col font-sans px-4 sm:px-6 relative w-full min-h-screen max-w-7xl mx-auto">
      {/* Header / Navbar */}
      <nav className="flex justify-between items-center py-6 relative z-20 gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-rose-500/20">
            <Heart className="w-5 h-5 text-white fill-current" />
          </div>
          <span className="text-2xl font-light tracking-tight text-white">
            Us<span className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-rose-400 to-indigo-400">Together</span>
          </span>
        </div>

        <button
          onClick={signIn}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-medium text-sm border border-white/10 backdrop-blur-md transition-all active:scale-95"
        >
          <span>Sign In</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center relative z-10">
        <LandingSections onGetStarted={signIn} />
      </main>

      {/* Footer */}
      <footer className="py-8 flex flex-col md:flex-row justify-between items-center text-xs text-slate-400 border-t border-white/5 relative z-10 gap-4">
        <div>&copy; {new Date().getFullYear()} UsTogether. All rights reserved. Designed for intimacy & connection.</div>
        <div className="flex items-center gap-6">
          <a href="#" className="hover:text-rose-400 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-rose-400 transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-rose-400 transition-colors">Contact</a>
        </div>
      </footer>
    </div>
  );
}
