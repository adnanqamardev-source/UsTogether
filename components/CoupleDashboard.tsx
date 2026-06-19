"use client";

import { useState, useEffect, Suspense } from 'react';
import { useAuth } from './AuthProvider';
import { Heart, MessageCircle, LogOut, CheckCircle2, Play, Users, UserMinus, Loader } from 'lucide-react';
import { doc, getDoc, collection, query, where, onSnapshot, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { handleFirestoreError, OperationType } from '@/lib/firestore-errors';
import dynamic from 'next/dynamic';
import QuizList from './QuizList';
import StreakCounter from './StreakCounter';
import AchievementsPanel from './AchievementsPanel';

const ChatDrawer = dynamic(() => import('./ChatDrawer'), { ssr: false, loading: () => <div className="fixed bottom-6 right-6 w-80 h-96 bg-[#0F0A1F] border border-white/10 rounded-2xl shadow-2xl flex items-center justify-center z-50"><Loader className="w-6 h-6 text-white animate-spin" /></div> });
const MemoryBoard = dynamic(() => import('./MemoryBoard'), { ssr: false, loading: () => <div className="flex items-center justify-center h-full"><Loader className="w-8 h-8 text-indigo-400 animate-spin" /></div> });
const ActiveSession = dynamic(() => import('./ActiveSession'), { ssr: false, loading: () => <div className="flex items-center justify-center h-full"><Loader className="w-8 h-8 text-indigo-400 animate-spin" /></div> });

export default function CoupleDashboard({ coupleId }: { coupleId: string }) {
  const { user, logOut } = useAuth();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeHash, setActiveHash] = useState('');
  const [couple, setCouple] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [achievements, setAchievements] = useState<any[]>([]);

  useEffect(() => {
    setActiveHash(window.location.hash);
    const handleHash = () => setActiveHash(window.location.hash);
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  useEffect(() => {
    if (!coupleId || !user) return;
    const unsub = onSnapshot(doc(db, 'couples', coupleId), (snap) => {
      if (snap.exists()) setCouple(snap.data());
    });
    const userUnsub = onSnapshot(doc(db, 'users', user.uid), (snap) => {
      if (snap.exists()) setUserProfile(snap.data());
    });
    const achUnsub = onSnapshot(collection(db, 'achievements', user.uid, 'items'), (snap) => {
      setAchievements(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => { unsub(); userUnsub(); achUnsub(); };
  }, [coupleId, user]);

  const sessionMatch = activeHash.match(/^#session\/(.+)$/);
  const sessionId = sessionMatch ? sessionMatch[1] : null;
  const coupleScore = couple?.totalScore || 0;

  const handleUnpair = async () => {
    if (!window.confirm('Are you sure you want to disconnect from your partner?')) return;
    if (!user) return;
    try {
      const coupleRef = doc(db, 'couples', coupleId);
      const coupleSnap = await getDoc(coupleRef);
      const partnerId = coupleSnap.exists() ?
        (coupleSnap.data().user1Id === user.uid ? coupleSnap.data().user2Id : coupleSnap.data().user1Id)
        : null;
      await updateDoc(doc(db, 'users', user.uid), { pairedCoupleId: null, updatedAt: Date.now() });
      if (partnerId) await updateDoc(doc(db, 'users', partnerId), { pairedCoupleId: null, updatedAt: Date.now() });
       if (coupleSnap.exists()) await deleteDoc(coupleRef);
       try { await deleteDoc(doc(db, 'pairingCodes', user.uid.substring(0, 8).toUpperCase())); } catch {}
       if (partnerId) try { await deleteDoc(doc(db, 'pairingCodes', partnerId.substring(0, 8).toUpperCase())); } catch {}
    } catch (e: any) { handleFirestoreError(e, OperationType.UPDATE, `users`); }
  };

  const isMemories = activeHash === '#memories';

  return (
    <div className="flex-1 flex flex-col font-sans relative w-full min-h-screen max-w-6xl mx-auto text-[#F8FAFC]">
      <div className="fixed top-0 left-1/4 -translate-y-1/2 w-[600px] h-[600px] bg-rose-900/15 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-0 right-0 translate-x-1/3 translate-y-1/3 w-[500px] h-[500px] bg-indigo-900/15 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed top-1/2 left-0 -translate-x-1/2 w-[400px] h-[400px] bg-purple-900/10 blur-[120px] rounded-full pointer-events-none" />

      {isChatOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={() => setIsChatOpen(false)} />
      )}

      <nav className="flex flex-col md:flex-row justify-between items-center mb-6 relative z-10 gap-4 mt-2 sm:mt-6">
        <div className="flex items-center space-x-3 cursor-pointer shrink-0" onClick={() => window.location.hash = ''}>
          <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-rose-500/20">
            <span className="font-bold text-xl text-white">U</span>
          </div>
          <span className="text-2xl font-light tracking-tight whitespace-nowrap">Us<span className="font-bold">Together</span></span>
        </div>
        <div className="hidden md:flex space-x-8 text-sm uppercase tracking-[0.2em] font-medium text-slate-400">
          <a href="#" onClick={() => window.location.hash = ''} className={`transition-colors ${!sessionId && !isMemories ? 'text-rose-400 border-b border-rose-400 pb-1' : 'hover:text-white'}`}>Quizzes</a>
          <a href="#memories" className={`transition-colors ${isMemories ? 'text-rose-400 border-b border-rose-400 pb-1' : 'hover:text-white'} flex items-center gap-2`}>Memories</a>
          <button onClick={() => setIsChatOpen(true)} className="hover:text-white transition-colors flex items-center gap-2 text-indigo-300">
            <MessageCircle className="w-4 h-4" /> Chat
          </button>
        </div>
        <div className="flex items-center space-x-4">
          <button onClick={handleUnpair} className="text-xs uppercase tracking-widest text-slate-500 hover:text-rose-400 transition-colors flex items-center gap-1 shrink-0">
            <UserMinus className="w-3 h-3" /> Disconnect
          </button>
          <button onClick={logOut} className="text-xs uppercase tracking-widest text-slate-500 hover:text-rose-400 transition-colors shrink-0 whitespace-nowrap">Log Out</button>
          <div className="flex -space-x-3 shrink-0">
            <div className="w-10 h-10 rounded-full border-2 border-[#0F0A1F] bg-indigo-500 flex items-center justify-center text-xs font-bold text-white shadow-lg">{user?.email?.[0].toUpperCase()}</div>
          </div>
        </div>
      </nav>

      {isChatOpen && (
        <div className="fixed right-0 top-0 h-full max-w-sm w-full z-50">
          <Suspense fallback={<div className="w-full h-full bg-[#0F0A1F] border-l border-white/10 flex items-center justify-center"><Loader className="w-8 h-8 text-white animate-spin" /></div>}>
            <ChatDrawer coupleId={coupleId} onClose={() => setIsChatOpen(false)} />
          </Suspense>
        </div>
      )}

      <main className="flex-1 relative z-10 w-full p-4 sm:p-10">
        {isMemories ? (
          <MemoryBoard coupleId={coupleId} />
        ) : !sessionId ? (
          <>
            <header className="mb-12">
              <h1 className="text-4xl md:text-5xl font-serif italic mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white to-indigo-200">Hi, {user?.displayName || user?.email?.split('@')[0]} 👋</h1>
              <p className="text-indigo-200/60 font-light">Pick a quiz or game to challenge your partner.</p>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
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