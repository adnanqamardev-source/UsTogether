"use client";

import { useState, useEffect, Suspense } from 'react';
import { useAuth } from './AuthProvider';
import { useIsMobile } from '@/hooks/use-mobile';
import { Heart, MessageCircle, LogOut, CheckCircle2, Play, Users, UserMinus, Loader, Menu, X } from 'lucide-react';
import { doc, getDoc, collection, query, where, onSnapshot, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { handleFirestoreError, OperationType } from '@/lib/firestore-errors';
import dynamic from 'next/dynamic';
import QuizList from './QuizList';

// Dynamically import heavy interactive components to reduce initial bundle size
const ChatDrawer = dynamic(() => import('./ChatDrawer'), { ssr: false, loading: () => <div className="fixed bottom-6 right-6 w-80 h-96 bg-[#0F0A1F] border border-white/10 rounded-2xl shadow-2xl flex items-center justify-center z-50"><Loader className="w-6 h-6 text-white animate-spin" /></div> });
const MemoryBoard = dynamic(() => import('./MemoryBoard'), { ssr: false, loading: () => <div className="flex items-center justify-center h-full"><Loader className="w-8 h-8 text-indigo-400 animate-spin" /></div> });
const ActiveSession = dynamic(() => import('./ActiveSession'), { ssr: false, loading: () => <div className="flex items-center justify-center h-full"><Loader className="w-8 h-8 text-indigo-400 animate-spin" /></div> });

export default function CoupleDashboard({ coupleId }: { coupleId: string }) {
  const { user, logOut } = useAuth();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeHash, setActiveHash] = useState('');
  const [couple, setCouple] = useState<any>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    setActiveHash(window.location.hash);
    const handleHash = () => setActiveHash(window.location.hash);
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  useEffect(() => {
    if (!coupleId) return;
    const unsub = onSnapshot(doc(db, 'couples', coupleId), (snap) => {
      if (snap.exists()) {
        setCouple(snap.data());
      }
    });
    return () => unsub();
  }, [coupleId]);

  const sessionMatch = activeHash.match(/^#session\/(.+)$/);
  const sessionId = sessionMatch ? sessionMatch[1] : null;
  const coupleScore = couple?.totalScore || 0;

  const handleUnpair = async () => {
    if (!window.confirm('Are you sure you want to disconnect from your partner? You will need to pair again to see your shared history.')) return;
    if (!user) return;
    try {
      // Fetch the couple document to identify the partner ID
      const coupleRef = doc(db, 'couples', coupleId);
      const coupleSnap = await getDoc(coupleRef);
      const partnerId = coupleSnap.exists() ?
        (coupleSnap.data().user1Id === user.uid ? coupleSnap.data().user2Id : coupleSnap.data().user1Id)
        : null;

      // Clear pairedCoupleId for the current user
      await updateDoc(doc(db, 'users', user.uid), {
        pairedCoupleId: null,
        updatedAt: Date.now(),
      });

      // Also clear for the partner if we have the ID
      if (partnerId) {
        await updateDoc(doc(db, 'users', partnerId), {
          pairedCoupleId: null,
          updatedAt: Date.now(),
        });
      }

      // Delete the couple document to fully terminate the session
      if (coupleSnap.exists()) {
        await deleteDoc(coupleRef);
      }

      // Optionally clean up any pairing codes (best‑effort, ignore errors)
      try {
        await deleteDoc(doc(db, 'pairingCodes', user.uid.substring(0, 8).toUpperCase()));
      } catch {}
      if (partnerId) {
        try {
          // Assuming partner's code is derived similarly from UID
          await deleteDoc(doc(db, 'pairingCodes', partnerId.substring(0, 8).toUpperCase()));
        } catch {}
      }

      window.location.reload();
    } catch (e: any) {
      handleFirestoreError(e, OperationType.UPDATE, `users`);
    }
  };

  const isMemories = activeHash === '#memories';

  return (
    <div className="flex-1 flex flex-col font-sans p-2 sm:p-6 relative w-full min-h-screen max-w-7xl mx-auto text-[#F8FAFC]">
      <nav className="flex flex-col md:flex-row justify-between items-center mb-6 relative z-10 gap-4 mt-2 sm:mt-6">
        {/* Left: Hamburger menu (mobile) or nav links (desktop) */}
        <div className="flex items-center space-x-4">
          {/* Hamburger menu - mobile only */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-white/50 hover:bg-white/10 hover:text-white rounded-full transition-colors"
            aria-label="Open menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          
          {/* Logo - centered */}
          <div className="flex-1 flex items-center justify-center">
            <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-rose-500/20">
              <span className="font-bold text-xl text-white">U</span>
            </div>
            <span className="text-2xl font-light tracking-tight">Us<span className="font-bold">Together</span></span>
          </div>
        </div>
        
        {/* Right: Profile avatar and desktop nav links */}
        <div className="flex items-center space-x-4">
          {/* Desktop nav links - hidden on mobile */}
          <div className="hidden md:flex space-x-8 text-sm uppercase tracking-[0.2em] font-medium text-slate-400">
            <a href="#" onClick={() => window.location.hash = ''} className={`transition-colors ${!sessionId && !isMemories ? 'text-rose-400 border-b border-rose-400 pb-1' : 'hover:text-white'}`}>Quizzes</a>
            <a href="#memories" className={`transition-colors ${isMemories ? 'text-rose-400 border-b border-rose-400 pb-1' : 'hover:text-white'} flex items-center gap-2`}>
              Memories
            </a>
            <button onClick={() => setIsChatOpen(true)} className="hover:text-white transition-colors flex items-center gap-2 text-indigo-300">
              <MessageCircle className="w-4 h-4" /> Chat
            </button>
          </div>
          
          {/* Profile avatar */}
          <div className="flex -space-x-3">
            <div className="w-10 h-10 rounded-full border-2 border-[#0F0A1F] bg-indigo-500 flex items-center justify-center text-xs font-bold text-white shadow-lg">{user?.email?.[0].toUpperCase()}</div>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {isMobile && isMobileMenuOpen && (
        <div className="absolute top-[80px] left-0 right-0 bg-[#0F0A1F]/90 backdrop-blur-sm border-t border-white/5 z-20">
          <div className="space-y-1 px-4 py-6">
            <a href="#" onClick={() => {
              window.location.hash = '';
              setIsMobileMenuOpen(false);
            }} className={`block text-sm uppercase tracking-[0.2em] font-medium text-slate-400 hover:text-white transition-colors ${!sessionId && !isMemories ? 'text-rose-400 border-b border-rose-400 pb-1' : ''}`}>Quizzes</a>
            <a href="#memories" onClick={() => setIsMobileMenuOpen(false)} className={`block text-sm uppercase tracking-[0.2em] font-medium text-slate-400 hover:text-white transition-colors ${isMemories ? 'text-rose-400 border-b border-rose-400 pb-1' : ''}`}>Memories</a>
            <button onClick={() => {
              setIsChatOpen(true);
              setIsMobileMenuOpen(false);
            }} className="block text-sm uppercase tracking-[0.2em] font-medium text-slate-400 flex items-center gap-2 hover:text-white transition-colors text-indigo-300">
              <MessageCircle className="w-4 h-4" /> Chat
            </button>
            <div className="border-t border-white/5 my-4"></div>
            <button onClick={handleUnpair} className="block w-full text-left text-xs uppercase tracking-widest text-slate-500 hover:text-rose-400 transition-colors flex items-center gap-2 px-4 py-2">
              <UserMinus className="w-4 h-4" /> Disconnect
            </button>
            <button onClick={logOut} className="block w-full text-left text-xs uppercase tracking-widest text-slate-500 hover:text-rose-400 transition-colors flex items-center gap-2 px-4 py-2">
              Log Out
            </button>
          </div>
        </div>
      )}

      <main className="flex-1 rounded-[40px] flex flex-col p-6 sm:p-10 relative z-10 w-full backdrop-blur-sm bg-white/5 border border-white/10 shadow-2xl">
        {isMemories ? (
          <MemoryBoard coupleId={coupleId} />
        ) : !sessionId ? (
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

      {/* Floating chat widget */}
      {isChatOpen && (
        <Suspense fallback={<div className="fixed bottom-6 right-6 w-80 h-96 bg-[#0F0A1F] border border-white/10 rounded-2xl shadow-2xl flex items-center justify-center z-50"><Loader className="w-6 h-6 text-white animate-spin" /></div>}>
          <ChatDrawer coupleId={coupleId} onClose={() => setIsChatOpen(false)} />
        </Suspense>
      )}
    </div>
  );
}