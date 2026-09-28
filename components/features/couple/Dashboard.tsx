"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers';
import { motion } from 'motion/react';
import { Heart, Users, ArrowRight, Copy, Check } from 'lucide-react';
import { doc } from '@/lib/firestore';
import { db, isDemo } from '@/lib/firebase/client';
import { createPairingCode, getPairingCode, batchWrite } from '@/lib/firebase/client';
import CoupleDashboard from './CoupleDashboard';
import type { UserProfile } from '@/types';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function Dashboard() {
  const router = useRouter();
  const { user, dbUser, logOut } = useAuth();
  const [partnerCode, setPartnerCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [myCode, setMyCode] = useState<string>('');
  const [codeCopied, setCodeCopied] = useState(false);

  useEffect(() => {
      if (user && !myCode && !dbUser?.pairedCoupleId) {
        const code = user.uid.substring(0, 8).toUpperCase();
        setMyCode(code);
        if (!isDemo) {
          createPairingCode(user.uid).catch((err) => {
            console.error('Failed to create pairing code:', err);
          });
        }
      }
  }, [user, dbUser, myCode]);

  // If partner connects, AuthProvider updates dbUser automatically.
  // No need to query couples manually.

  if (!user) return null;

  // If user is already paired
  if (dbUser?.pairedCoupleId) {
    return <CoupleDashboard coupleId={dbUser.pairedCoupleId} />;
  }

  const handlePair = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!partnerCode || !user.uid) return;
    const codeStr = partnerCode.trim().toUpperCase();
    if (codeStr === myCode) {
      setErrorMsg("You can't pair with yourself!");
      return;
    }

    setLoading(true);
    try {
        const codeDoc = await getPairingCode(codeStr);
        if (!codeDoc) {
            throw new Error('Invalid or expired pairing code.');
        }
        const partnerId = codeDoc.userId;

        const coupleId = [user.uid, partnerId].sort().join('_');

        const userRef = doc(db, 'users', user.uid);
        const partnerRef = doc(db, 'users', partnerId);
        const coupleRef = doc(db, 'couples', coupleId);
        const codeRef = doc(db, 'pairingCodes', codeStr);
        const now = Date.now();

        await batchWrite([
          { type: 'set', ref: coupleRef, data: {
            user1Id: user.uid < partnerId ? user.uid : partnerId,
            user2Id: user.uid > partnerId ? user.uid : partnerId,
            status: 'active',
            totalScore: 0,
            createdAt: now,
            updatedAt: now,
          }},
          { type: 'update', ref: userRef, data: { pairedCoupleId: coupleId, updatedAt: now } },
          { type: 'update', ref: partnerRef, data: { pairedCoupleId: coupleId, updatedAt: now } },
          { type: 'delete', ref: codeRef },
        ]);

        router.refresh();
    } catch (err: any) {
        setErrorMsg(err.message || 'Error occurred');
    } finally {
        setLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (myCode) {
      navigator.clipboard.writeText(myCode);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    }
  };

  return (
    <div className="flex-1 flex flex-col font-sans p-4 sm:p-6 relative w-full h-full max-w-6xl mx-auto">
      <nav className="flex justify-between items-center mb-12 relative z-10 gap-4 mt-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br bg-lilac-ash rounded-xl flex items-center justify-center shadow-lg shadow-[#bcabae]/20">
            <span className="font-bold text-xl text-white">U</span>
          </div>
          <span className="text-2xl font-light tracking-tight text-white">Us<span className="font-bold">Together</span></span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-[#bcabae] font-bold uppercase tracking-widest hidden sm:inline">{user?.displayName || user?.email?.split('@')[0]}</span>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center relative z-10 w-full mb-20 px-2">
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-md rounded-[40px] shadow-2xl border border-white/10 p-6 sm:p-8 md:p-12 text-center w-full max-w-2xl mx-auto relative overflow-hidden"
        >
          <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-[#bcabae]/20 rounded-full blur-[80px] pointer-events-none"></div>
           
          <div className="w-20 h-20 bg-[#2d2e2e]/20 text-[#bcabae] border border-[#2d2e2e]/30 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner shadow-[#2d2e2e]/20">
            <Users className="w-10 h-10" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif italic mb-4 text-white">Connect with your Partner</h2>
          <p className="text-sm sm:text-base text-[#bcabae]/80 mb-10 leading-relaxed font-light">
            Share your connection code with your partner, or enter theirs below to start playing.
          </p>

          <div className="bg-black/20 p-6 sm:p-8 rounded-3xl mb-10 border border-white/5 hover:scale-105 hover:bg-black/30 hover:border-white/10 hover:shadow-[0_0_20px_rgba(99,102,241,0.2)] transition-all duration-300 cursor-pointer group">
            <p className="text-xs text-[#716969] mb-4 uppercase tracking-[0.2em] font-bold">Your Code</p>
            <div className="bg-black/30 rounded-xl p-4 mb-4 min-h-[80px] sm:min-h-[100px] flex items-center justify-center overflow-hidden">
              <p className="font-mono text-4xl sm:text-5xl md:text-6xl tracking-widest text-white font-light select-all word-break break-all text-center">{myCode || '........'}</p>
            </div>
            <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {codeCopied ? (
                <>
                  <Check className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-green-400 font-mono">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-[#bcabae]" />
                  <span className="text-xs text-[#bcabae] font-mono">Click to copy</span>
                </>
              )}
            </div>
          </div>

          <form onSubmit={handlePair} className="flex flex-col gap-4">
            <Input
              type="text"
              value={partnerCode}
              onChange={e => setPartnerCode(e.target.value)}
              placeholder="ENTER PARTNER CODE"
              maxLength={8}
              className="text-center font-mono tracking-widest uppercase text-lg"
              label="Partner Code"
            />
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={loading}
              disabled={!partnerCode}
              className="w-full"
            >
              {loading ? 'Pairing...' : 'Connect'}
              <ArrowRight className="w-5 h-5" />
            </Button>
          </form>
          {errorMsg && <p className="text-[#bcabae] text-xs uppercase tracking-widest font-bold mt-6">{errorMsg}</p>}
        </motion.div>
      </main>
    </div>
  );
}
