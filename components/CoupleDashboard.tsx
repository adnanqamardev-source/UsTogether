"use client";

import { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from './AuthProvider';
import { MessageCircle, LogOut, UserMinus, Loader, Menu, X } from 'lucide-react';
import { doc, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  useFirestoreDocument,
  useFirestoreCollection,
  batchWrite,
} from '@/lib/firebase';
import { updateStreak } from '@/lib/streak';
import { checkAndAwardAchievements } from '@/lib/achievements';
import type { Couple, UserProfile, Achievement, Session } from '../global.d';
import dynamic from 'next/dynamic';
import QuizList from './QuizList';
import StreakCounter from './StreakCounter';
import AchievementsPanel from './AchievementsPanel';
import ErrorBoundary from './ErrorBoundary';
import BottomNav from './BottomNav';
import ChatFAB from './ChatFAB';
import { DashboardSkeleton, AchievementsPanelSkeleton, ChatPanelSkeleton } from './Skeletons';

const ChatDrawer = dynamic(() => import('./ChatDrawer'), {
  ssr: false,
  loading: () => <div className="fixed bottom-6 right-6 w-80 h-96 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl flex items-center justify-center z-50"><Loader className="w-6 h-6 text-white animate-spin" /></div>
});
const MemoryBoard = dynamic(() => import('./MemoryBoard'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full"><Loader className="w-8 h-8 text-indigo-400 animate-spin" /></div>
});
const ActiveSession = dynamic(() => import('./ActiveSession'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full"><Loader className="w-8 h-8 text-indigo-400 animate-spin" /></div>
});

type MobileMenuProps = {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string | null;
  isMemories: boolean;
  isStats: boolean;
  onUnpair: () => void;
  onLogout: () => void;
  onOpenChat: () => void;
};

const MobileMenu = ({ isOpen, onClose, sessionId, isMemories, isStats, onUnpair, onLogout, onOpenChat }: MobileMenuProps) => (
  <AnimatePresence>
    {isOpen && (
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        />
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          className="md:hidden fixed top-24 left-4 right-4 bg-slate-900/95 backdrop-blur-xl z-50 rounded-2xl border border-white/10 shadow-2xl p-6"
        >
          <div className="flex flex-col gap-6 text-sm uppercase tracking-widest font-bold">
            <a href="#" onClick={() => { window.location.hash = ''; onClose(); }} className={`${!sessionId && !isMemories && !isStats ? 'text-rose-400' : 'text-slate-300'}`}>Quizzes</a>
            <a href="#memories" onClick={onClose} className={`${isMemories ? 'text-rose-400' : 'text-slate-300'}`}>Memories</a>
            <a href="#stats" onClick={onClose} className={`${isStats ? 'text-rose-400' : 'text-slate-300'}`}>Stats</a>
            <button onClick={() => { onOpenChat(); onClose(); }} className="text-left text-slate-300 flex items-center gap-3">
              <MessageCircle size={18} /> Chat
            </button>
            <hr className="border-white/10 my-2" />
            <button onClick={() => { onUnpair(); onClose(); }} className="text-left text-rose-400 flex items-center gap-3">
              <UserMinus size={18} /> Disconnect
            </button>
            <button onClick={() => { onLogout(); onClose(); }} className="text-left text-slate-400 flex items-center gap-3">
              <LogOut size={18} /> Log Out
            </button>
          </div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

export default function CoupleDashboard({ coupleId }: { coupleId: string }) {
  const { user, logOut } = useAuth();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeHash, setActiveHash] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sessionsFinished, setSessionsFinished] = useState(0);
  const [quizzesCompleted, setQuizzesCompleted] = useState(0);

  const { data: couple, loading: coupleLoading } = useFirestoreDocument<Couple>(['couples', coupleId]);
  const { data: userProfile, loading: userLoading } = useFirestoreDocument<UserProfile>(user ? ['users', user.uid] : []);
  const { data: achievements } = useFirestoreCollection<Achievement>(
    user ? ['achievements', user.uid, 'items'] : undefined as any,
    [],
    (id, data) => ({ id, ...(data as Omit<Achievement, 'id'>) } as Achievement)
  );

  const finishedConstraints = user && coupleId
    ? [where('coupleId', '==', coupleId), where('status', '==', 'finished')]
    : undefined as any;

  const { data: finishedSessions } = useFirestoreCollection<Session>(
    user && coupleId ? ['couples', coupleId, 'sessions'] : [],
    finishedConstraints,
    (id, data) => ({ id, ...(data as Omit<Session, 'id'>) } as Session)
  );

  useEffect(() => {
    setActiveHash(window.location.hash);
    const handleHash = () => setActiveHash(window.location.hash);
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  useEffect(() => {
    if (finishedSessions) {
      setSessionsFinished(finishedSessions.length);
      const qCount = finishedSessions.reduce((acc, s) => acc + (s.quizTitle ? 1 : 0), 0);
      setQuizzesCompleted(qCount);
    }
  }, [finishedSessions]);

  const partnerId =
    couple && user
      ? couple.user1Id === user.uid
        ? couple.user2Id
        : couple.user1Id
      : '';

  const sessionMatch = activeHash.match(/^#session\/(.+)$/);
  const sessionId = sessionMatch ? sessionMatch[1] : null;
  const isMemories = activeHash === '#memories';
  const isStats = activeHash === '#stats';

  const handleUnpair = async () => {
    if (!window.confirm('Are you sure you want to disconnect from your partner?')) return;
    if (!user || !couple) {
      alert('Please sign in again to disconnect.');
      return;
    }
    
    try {
      // Ensure auth token is valid before attempting write
      const token = await user.getIdToken(true);
      if (!token) {
        alert('Authentication expired. Please sign in again.');
        return;
      }
      
      const userRef = doc(db, 'users', user.uid);
      const partnerRef = doc(db, 'users', partnerId);
      const coupleRef = doc(db, 'couples', coupleId);
      const now = Date.now();

      await batchWrite([
        { type: 'update', ref: userRef, data: { pairedCoupleId: '', updatedAt: now } },
        { type: 'update', ref: partnerRef, data: { pairedCoupleId: '', updatedAt: now } },
        { type: 'delete', ref: coupleRef },
      ]);
      
      // Force page refresh to reset auth state
      window.location.reload();
    } catch (e: any) {
      console.error('Unpair failed', e);
      // Handle permission denied specifically
      if (e?.message?.includes('Missing or insufficient permissions') || e?.code === 'permission-denied') {
        alert('Cannot disconnect: Authentication issue. Please disable ad blockers and try again.');
      } else {
        alert('Failed to disconnect. Please try again.');
      }
    }
  };

  useEffect(() => {
    if (!user || !userProfile) return;
    (async () => {
      try {
        const result = await updateStreak(user.uid);
        await checkAndAwardAchievements(user.uid, {
          currentStreak: result.streak,
          quizzesCompleted,
          sessionsFinished,
          paired: !!userProfile.pairedCoupleId,
        });
      } catch (e) {
        console.error('Streak or achievement check failed', e);
      }
    })();
  }, [user?.uid, userProfile?.pairedCoupleId]);

  const isLoading = coupleLoading || userLoading;

  return (
    <div className="flex-1 flex flex-col font-sans relative w-full min-h-screen max-w-6xl mx-auto text-[#F8FAFC]">
      {/* Background Ambient Glows */}
      <div className="fixed top-0 left-1/4 -translate-y-1/2 w-[600px] h-[600px] bg-rose-900/15 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-0 right-0 translate-x-1/3 translate-y-1/3 w-[500px] h-[500px] bg-indigo-900/15 blur-[120px] rounded-full pointer-events-none" />

      {/* Chat Overlay */}
      {isChatOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={() => setIsChatOpen(false)} />
      )}

      {/* Main Navigation */}
      <nav className="flex justify-between items-center mb-6 relative z-10 pt-6 px-5 sm:px-10">
        {/* Logo Section */}
        <div className="flex items-center space-x-3 cursor-pointer shrink-0" onClick={() => window.location.hash = ''}>
          <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <span className="font-bold text-xl text-white">U</span>
          </div>
          <span className="text-xl font-medium tracking-tight hidden sm:block">Us<span className="font-bold">Together</span></span>
        </div>

        {/* Desktop Center Links */}
        <div className="hidden md:flex items-center space-x-10 text-xs uppercase tracking-[0.15em] font-bold text-slate-400">
          <a href="#" onClick={() => window.location.hash = ''} className={`transition-all pb-2 border-b-2 ${!sessionId && !isMemories ? 'text-rose-400 border-rose-400' : 'border-transparent hover:text-white'}`}>Quizzes</a>
          <a href="#memories" className={`transition-all pb-2 border-b-2 ${isMemories ? 'text-rose-400 border-rose-400' : 'border-transparent hover:text-white'}`}>Memories</a>
          <a href="#stats" className="hover:text-white transition-colors flex items-center gap-2 pb-2 border-b-2 border-transparent">Stats</a>
          <button onClick={() => setIsChatOpen(true)} className="hover:text-white transition-colors flex items-center gap-2 pb-2 border-b-2 border-transparent">
            <MessageCircle className="w-4 h-4" /> Chat
          </button>
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center space-x-6 text-xs uppercase tracking-widest font-semibold text-slate-400">
          <button onClick={handleUnpair} className="hover:text-rose-400 transition-colors flex items-center gap-2">
            <UserMinus className="w-4 h-4" /> Disconnect
          </button>
          <button onClick={logOut} className="hover:text-white transition-colors">Log Out</button>
          <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-sm font-bold text-white shadow-md">
            {user?.displayName?.[0].toUpperCase() || user?.email?.[0].toUpperCase() || 'U'}
          </div>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-slate-300 hover:text-white transition-colors"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* Render Extracted Mobile Menu */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        sessionId={sessionId}
        isMemories={isMemories}
        isStats={isStats}
        onUnpair={handleUnpair}
        onLogout={logOut}
        onOpenChat={() => setIsChatOpen(true)}
      />

      {/* Chat Drawer Side Panel */}
      {isChatOpen && (
        <div className="fixed right-0 top-0 h-full max-w-sm w-full z-50">
          <Suspense fallback={<ChatPanelSkeleton />}>
            <ChatDrawer coupleId={coupleId} onClose={() => setIsChatOpen(false)} />
          </Suspense>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 relative z-10 w-full p-5 sm:p-10 pb-28">
        <BottomNav onChatClick={() => setIsChatOpen(true)} />
        <ChatFAB onClick={() => setIsChatOpen(true)} />
        {isLoading ? (
          <DashboardSkeleton />
        ) : isStats ? (
          <div className="py-8 md:py-12 w-full max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-serif italic mb-6 text-white">Stats</h1>
            <p className="text-slate-400">Analytics coming soon. This page will show your couple's progress, streak, and achievements.</p>
          </div>
        ) : isMemories ? (
          <MemoryBoard coupleId={coupleId} />
        ) : !sessionId ? (
          <>
            <header className="mb-8 md:mb-10">
              <h1 className="text-4xl md:text-5xl font-serif italic mb-3 text-white">
                {isLoading ? 'Loading...' : `Hi, ${userProfile?.displayName || user?.email?.split('@')[0]} ☁️`}
              </h1>
              <p className="text-slate-400 text-sm md:text-base">Pick a quiz or game to challenge your partner.</p>
            </header>

            {/* Asymmetrical Widgets: Hero card + 2-up grid */}
            <div className="space-y-4 mb-12">
              {/* Hero card: active session / unread messages */}
              <motion.div
                whileHover={{ scale: 1.01 }}
                className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-xl"
              >
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-rose-500/20 blur-[60px] rounded-full pointer-events-none" />
                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.25em] text-indigo-300 mb-1">Connection Status</p>
                    <h3 className="text-2xl font-serif italic text-white">You & Partner are paired ✨</h3>
                    <p className="text-indigo-200/60 text-sm mt-1">Complete a quiz together to keep the streak alive.</p>
                  </div>
                  <button onClick={() => { window.location.hash = ''; }} className="shrink-0 bg-indigo-500 hover:bg-indigo-400 text-white font-bold uppercase tracking-widest text-xs py-3 px-6 rounded-full transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)]">
                    Start Quiz
                  </button>
                </div>
              </motion.div>

              {/* 2-up grid for secondary widgets */}
               <div className="grid grid-cols-2 gap-4">
                <StreakCounter streak={userProfile?.streak || 0} />
                {achievements ? (
                  <AchievementsPanel achievements={achievements} />
                ) : (
                  <AchievementsPanelSkeleton />
                )}
              </div>
            </div>

            <QuizList coupleId={coupleId} />
          </>
        ) : (
          <ErrorBoundary>
            <ActiveSession coupleId={coupleId} sessionId={sessionId} couple={couple} />
          </ErrorBoundary>
        )}
      </main>
    </div>
  );
}