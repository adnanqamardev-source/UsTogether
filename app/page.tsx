"use client";

import { useAuth } from '@/components/AuthProvider';
import { motion } from 'motion/react';
import { LogIn } from 'lucide-react';
import Dashboard from '@/components/Dashboard';

export default function Home() {
  const { user, loading, signIn } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} 
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-indigo-600 rounded-xl shadow-lg shadow-rose-500/20" />
        </motion.div>
      </div>
    );
  }

  if (user) {
    return <Dashboard />;
  }

  return (
    <div className="flex-1 flex flex-col font-sans p-6 relative w-full min-h-screen max-w-6xl mx-auto">
      <nav className="flex justify-between items-center mb-12 relative z-10 gap-4 mt-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-rose-500/20">
            <span className="font-bold text-xl">U</span>
          </div>
          <span className="text-2xl font-light tracking-tight">Us<span className="font-bold">Together</span></span>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center relative z-10 p-6 md:p-12">
        <div className="max-w-3xl mx-auto text-center space-y-12">
          <motion.h1 
            className="text-5xl md:text-7xl font-serif italic tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#F8FAFC] to-indigo-200 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            How well do you know each other?
          </motion.h1>
          <motion.p 
            className="text-lg md:text-xl text-indigo-200/80 max-w-2xl mx-auto font-light"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            Create personalized quizzes relevant to your journey together, compete on leaderboards, and share real-time memories with your partner.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <button 
              onClick={signIn}
              className="py-5 px-10 rounded-3xl bg-rose-500 text-white font-bold text-lg inline-flex items-center gap-3 hover:bg-rose-600 ring-2 ring-rose-500/50 ring-offset-4 ring-offset-[#0F0A1F] transition-all cursor-pointer"
            >
              <LogIn className="w-6 h-6" />
              Sign in to Connect
            </button>
          </motion.div>
        </div>
      </main>
      
      <footer className="mt-6 flex justify-between items-center text-[10px] text-slate-500 uppercase tracking-widest relative z-10 border-t border-white/5 pt-4">
        <div>&copy; {new Date().getFullYear()} UsTogether. All rights reserved.</div>
      </footer>
    </div>
  );
}
