"use client";

import { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { Heart, MessageCircle, LogOut, CheckCircle2, Play, Users } from 'lucide-react';
import { doc, getDoc, collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import ChatDrawer from './ChatDrawer';
import QuizList from './QuizList';
import ActiveSession from './ActiveSession';

export default function CoupleDashboard({ coupleId }: { coupleId: string }) {
  const { user, logOut } = useAuth();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeHash, setActiveHash] = useState('');

  useEffect(() => {
    setActiveHash(window.location.hash);
    const handleHash = () => setActiveHash(window.location.hash);
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const sessionMatch = activeHash.match(/^#session\/(.+)$/);
  const sessionId = sessionMatch ? sessionMatch[1] : null;

  return (
    <div className="flex-1 flex flex-col font-sans p-2 sm:p-6 relative w-full min-h-screen max-w-7xl mx-auto text-[#F8FAFC]">
      <nav className="flex flex-col md:flex-row justify-between items-center mb-6 relative z-10 gap-4 mt-2 sm:mt-6">
        <div 
          className="flex items-center space-x-3 cursor-pointer"
          onClick={() => window.location.hash = ''}
        >
          <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-rose-500/20">
            <span className="font-bold text-xl text-white">U</span>
          </div>
          <span className="text-2xl font-light tracking-tight">Us<span className="font-bold">Together</span></span>
        </div>
        <div className="hidden md:flex space-x-8 text-sm uppercase tracking-[0.2em] font-medium text-slate-400">
          <a href="#" onClick={() => window.location.hash = ''} className={`transition-colors ${!sessionId ? 'text-rose-400 border-b border-rose-400 pb-1' : 'hover:text-white'}`}>Quizzes</a>
          <a href="#" className="hover:text-white transition-colors cursor-not-allowed opacity-50">Rewards</a>
          <button onClick={() => setIsChatOpen(true)} className="hover:text-white transition-colors flex items-center gap-2 text-indigo-300">
            <MessageCircle className="w-4 h-4" /> Chat
          </button>
        </div>
        <div className="flex items-center space-x-4">
          <button onClick={logOut} className="text-xs uppercase tracking-widest text-slate-500 hover:text-rose-400 transition-colors">
            Log Out
          </button>
          <div className="flex -space-x-3">
            <div className="w-10 h-10 rounded-full border-2 border-[#0F0A1F] bg-indigo-500 flex items-center justify-center text-xs font-bold text-white shadow-lg">{user?.email?.[0].toUpperCase()}</div>
          </div>
        </div>
      </nav>

      <main className="flex-1 rounded-[40px] flex flex-col p-6 sm:p-10 relative z-10 w-full backdrop-blur-sm bg-white/5 border border-white/10 shadow-2xl">
        {!sessionId ? (
           <>
              <header className="mb-12">
                <h1 className="text-4xl md:text-5xl font-serif italic mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white to-indigo-200">Hi, {user?.displayName || user?.email?.split('@')[0]} 👋</h1>
                <p className="text-indigo-200/60 font-light">Pick a quiz or game to challenge your partner.</p>
              </header>
              <QuizList coupleId={coupleId} />
           </>
        ) : (
           <ActiveSession coupleId={coupleId} sessionId={sessionId} />
        )}
      </main>

      <AnimatePresence>
        {isChatOpen && <ChatDrawer coupleId={coupleId} onClose={() => setIsChatOpen(false)} />}
      </AnimatePresence>
    </div>
  );
}
