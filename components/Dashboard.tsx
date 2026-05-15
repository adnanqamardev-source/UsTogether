"use client";

import { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { motion } from 'motion/react';
import { Heart, Users, ArrowRight } from 'lucide-react';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { handleFirestoreError, OperationType } from '@/lib/firestore-errors';
import CoupleDashboard from './CoupleDashboard';

export default function Dashboard() {
  const { user, dbUser, logOut } = useAuth();
  const [partnerCode, setPartnerCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [myCode, setMyCode] = useState<string>('');

  useEffect(() => {
     if (user && !myCode && !dbUser?.pairedCoupleId) {
        // use local logic for making a 6-digit code or use UID snippet.
        // UID first 6 chars might collide, let's use the first 8
        const code = user.uid.substring(0,8).toUpperCase();
        setMyCode(code);
        // create pairing code
        try {
           setDoc(doc(db, 'pairingCodes', code), {
             userId: user.uid,
             createdAt: Date.now()
           }, { merge: true });
        } catch(e) {}
     }
  }, [user, dbUser, myCode]);

  // If user is already paired
  if (dbUser?.pairedCoupleId) {
    return <CoupleDashboard coupleId={dbUser.pairedCoupleId} />;
  }

  const handlePair = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!partnerCode || !user?.uid) return;
    const codeStr = partnerCode.trim().toUpperCase();
    if (codeStr === myCode) {
      setErrorMsg("You can't pair with yourself!");
      return;
    }

    setLoading(true);
    try {
       // get the code
       const codeDoc = await getDoc(doc(db, 'pairingCodes', codeStr));
       if (!codeDoc.exists()) {
          throw new Error('Invalid or expired pairing code.');
       }
       const partnerId = codeDoc.data().userId;
       
       // Create Couple
       const coupleId = [user.uid, partnerId].sort().join('_');
       const coupleRef = doc(db, 'couples', coupleId);
       
       const coupleDoc = await getDoc(coupleRef);
       if (!coupleDoc.exists()) {
          const newCouple = {
             user1Id: user.uid < partnerId ? user.uid : partnerId,
             user2Id: user.uid > partnerId ? user.uid : partnerId,
             status: 'active',
             totalScore: 0,
             createdAt: Date.now(),
             updatedAt: Date.now(),
          };
          await setDoc(coupleRef, newCouple);
       }
       
       // Update both users (the other user might need to refresh or listen, but ideally this updates ourselves)
       await updateDoc(doc(db, 'users', user.uid), {
          pairedCoupleId: coupleId,
          updatedAt: Date.now()
       });
       // Actually, we are only allowed to update OUR user. 
       // The partner must either poll the couples collection OR we need a backend.
       // Since the partner can list couples where they are a member, they can detect the new couple.

       window.location.reload(); // Quick refresh to catch state
    } catch (err: any) {
       setErrorMsg(err.message || 'Error occurred');
       handleFirestoreError(err, OperationType.GET, `pairingCodes`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col font-sans p-6 relative w-full h-full max-w-6xl mx-auto">
      <nav className="flex justify-between items-center mb-12 relative z-10 gap-4 mt-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-rose-500/20">
            <span className="font-bold text-xl text-white">U</span>
          </div>
          <span className="text-2xl font-light tracking-tight text-[#F8FAFC]">Us<span className="font-bold">Together</span></span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-indigo-300 font-bold uppercase tracking-widest">{user?.displayName || user?.email?.split('@')[0]}</span>
          <button onClick={logOut} className="text-xs uppercase tracking-widest text-slate-500 hover:text-rose-400 transition-colors">
            Log Out
          </button>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center relative z-10 w-full mb-20">
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-md rounded-[40px] shadow-2xl border border-white/10 p-8 md:p-12 text-center w-full max-w-lg mx-auto relative overflow-hidden"
        >
          <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-rose-600/20 rounded-full blur-[80px] pointer-events-none"></div>
          
          <div className="w-20 h-20 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner shadow-indigo-500/20">
            <Users className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-serif italic mb-4 text-[#F8FAFC]">Connect with your Partner</h2>
          <p className="text-indigo-200/80 mb-10 leading-relaxed font-light">
            Share your connection code with your partner, or enter theirs below to start playing.
          </p>

          <div className="bg-black/20 p-6 rounded-3xl mb-10 border border-white/5">
             <p className="text-xs text-slate-400 mb-2 uppercase tracking-[0.2em] font-bold">Your Code</p>
             <p className="font-mono text-3xl md:text-4xl tracking-[0.2em] text-white font-light text-shadow-sm">{myCode || '...'}</p>
          </div>

          <form onSubmit={handlePair} className="flex flex-col gap-4">
            <input 
               type="text" 
               value={partnerCode}
               onChange={e => setPartnerCode(e.target.value)}
               className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-rose-500/50 text-white font-mono tracking-widest text-center uppercase" 
               placeholder="ENTER PARTNER CODE"
               maxLength={8}
            />
            <button 
               type="submit" 
               disabled={loading || !partnerCode}
               className="bg-rose-500 text-white rounded-2xl px-6 py-4 font-bold uppercase tracking-widest hover:bg-rose-600 disabled:opacity-50 disabled:hover:bg-rose-500 transition-all flex items-center justify-center gap-2 shadow-lg shadow-rose-500/20"
            >
               {loading ? 'Pairing...' : 'Connect'}
               <ArrowRight className="w-5 h-5" />
            </button>
          </form>
          {errorMsg && <p className="text-rose-400 text-xs uppercase tracking-widest font-bold mt-6">{errorMsg}</p>}
        </motion.div>
      </main>
    </div>
  );
}
