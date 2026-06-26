"use client";

import { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from './AuthProvider';
import { MessageCircle, LogOut, UserMinus, Loader, Menu, X } from 'lucide-react';
import { doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  useFirestoreDocument,
  useFirestoreCollection,
  batchWrite,
  deletePairingCode,
} from '@/lib/firebase';
import type { Couple, UserProfile, Achievement } from '../global.d';
import dynamic from 'next/dynamic';
import QuizList from './QuizList';
import StreakCounter from './StreakCounter';
import AchievementsPanel from './AchievementsPanel';

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
  onUnpair: () => void;
  onLogout: () => void;
  onOpenChat: () => void;
};

const MobileMenu = ({ isOpen, onClose, sessionId, isMemories, onUnpair, onLogout, onOpenChat }: MobileMenuProps) => (
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
            <a href="#" onClick={() => { window.location.hash = ''; onClose(); }} className={`${!sessionId && !isMemories ? 'text-rose-400' : 'text-slate-300'}`}>Quizzes</a>
            <a href="#memories" onClick={onClose} className={`${isMemories ? 'text-rose-400' : 'text-slate-300'}`}>Memories</a>
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

  const { data: couple, loading: coupleLoading } = useFirestoreDocument<Couple>(['couples', coupleId]);
  const { data: userProfile, loading: userLoading } = useFirestoreDocument<UserProfile>(['users', user?.uid || '']);
  const { data: achievements } = useFirestoreCollection<Achievement>(
    user ? ['achievements', user.uid, 'items'] : [],
    [],
    (id, data) => ({ id, ...(data as Omit<Achievement, 'id'>) } as Achievement)
  );

  const partnerId =
    couple && user
      ? couple.user1Id === user.uid
        ? couple.user2Id
        : couple.user1Id
      : '';

  useEffect(() => {
    setActiveHash(window.location.hash);
    const handleHash = () => setActiveHash(window.location.hash);
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const sessionMatch = activeHash.match(/^#session\/(.+)$/);
  const sessionId = sessionMatch ? sessionMatch[1] : null;
  const isMemories = activeHash === '#memories';

  const handleUnpair = async () => {
    if (!window.confirm('Are you sure you want to disconnect from your partner?')) return;
    if (!user || !couple) return;
    try {
      const userRef = doc(db, 'users', user.uid);
      const partnerRef = doc(db, 'users', partnerId);
      const coupleRef = doc(db, 'couples', coupleId);
      const now = Date.now();

      await batchWrite([
        { type: 'update', ref: userRef, data: { pairedCoupleId: '', updatedAt: now } },
        { type: 'update', ref: partnerRef, data: { pairedCoupleId: '', updatedAt: now } },
        { type: 'delete', ref: coupleRef },
        { type: 'delete', ref: doc(db, 'pairingCodes', user.uid.substring(0, 8).toUpperCase()) },
        { type: 'delete', ref: doc(db, 'pairingCodes', partnerId.substring(0, 8).toUpperCase()) },
      ]);
    } catch (e: any) {
      console.error('Unpair failed', e);
    }
  };

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
        onUnpair={handleUnpair}
        onLogout={logOut}
        onOpenChat={() => setIsChatOpen(true)}
      />

      {/* Chat Drawer Side Panel */}
      {isChatOpen && (
        <div className="fixed right-0 top-0 h-full max-w-sm w-full z-50">
          <Suspense fallback={<div className="w-full h-full bg-[#0F0A1F] border-l border-white/10 flex items-center justify-center"><Loader className="w-8 h-8 text-white animate-spin" /></div>}>
            <ChatDrawer coupleId={coupleId} onClose={() => setIsChatOpen(false)} />
          </Suspense>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 relative z-10 w-full p-5 sm:p-10">
        {isMemories ? (
          <MemoryBoard coupleId={coupleId} />
        ) : !sessionId ? (
          <>
            <header className="mb-8 md:mb-10">
              <h1 className="text-4xl md:text-5xl font-serif italic mb-3 text-white">
                {isLoading ? 'Loading...' : `Hi, ${userProfile?.displayName || user?.email?.split('@')[0]} ☁️`}
              </h1>
              <p className="text-slate-400 text-sm md:text-base">Pick a quiz or game to challenge your partner.</p>
            </header>

            {/* Widgts Row with improved grid spacing */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-12">
              <StreakCounter streak={userProfile?.streak || 0} />
              <AchievementsPanel achievements={achievements} />
            </div>

            <QuizList coupleId={coupleId} />
          </>
        ) : (
          <ActiveSession coupleId={coupleId} sessionId={sessionId} />
        )}
      </main>
    </div>
  );
}