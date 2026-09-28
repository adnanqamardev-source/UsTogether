"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers';
import { motion } from 'motion/react';
import { Heart, Users, ArrowRight, Copy, Check, LogOut } from 'lucide-react';
import { createPairingCode } from '@/lib/firebase/client';
import { pairWithCode, PairingError } from '@/lib/shared/couple-pairing';
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
        let cancelled = false;
        createPairingCode(user.uid).then((code) => {
          if (!cancelled) setMyCode(code);
        }).catch((err) => {
          console.error('Failed to create pairing code:', err);
        });
        return () => { cancelled = true; };
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

    setLoading(true);
    try {
        await pairWithCode(user.uid, partnerCode, myCode);
        // Success: the AuthProvider profile subscription picks up the new
        // pairedCoupleId and swaps to the paired view. Clear the field so a
        // double-submit can't retry the now-consumed single-use code.
        setPartnerCode('');

        router.refresh();
    } catch (err: any) {
        if (err instanceof PairingError && err.code === 'self') {
            setErrorMsg("You can't pair with yourself!");
        } else if (err instanceof PairingError && err.code === 'invalid-code') {
            setErrorMsg('Invalid or expired pairing code.');
        } else {
            setErrorMsg(err.message || 'Error occurred');
        }
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
          <button
            onClick={() => logOut()}
            className="flex items-center gap-2 text-xs text-[#bcabae]/70 hover:text-white font-bold uppercase tracking-widest transition-colors"
            aria-label="Log out"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
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

          <div className="bg-black/20 p-6 sm:p-8 rounded-3xl mb-10 border border-white/5 hover:scale-105 hover:bg-black/30 hover:border-white/10 hover:shadow-[0_0_20px_rgba(188,171,174,0.2)] transition-all duration-300 cursor-pointer group">
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
              maxLength={6}
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
