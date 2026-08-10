"use client";

import { useState, useEffect } from "react";
import { useAuth } from "./AuthProvider";
import { MessageCircle, Menu, X, LogOut, UserMinus, Loader2 } from "lucide-react";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { handleFirestoreError, OperationType } from "@/lib/firestore-errors";
import { useIsMobile } from "@/hooks/use-mobile";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import QuizList from "./QuizList";
import dynamic from "next/dynamic";

const ChatDrawer = dynamic(() => import("./ChatDrawer"), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 z-40 bg-black/50 flex items-center justify-center">
      <Loader2 className="w-6 h-6 animate-spin" />
    </div>
  ),
});
const MemoryBoard = dynamic(() => import("./MemoryBoard"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-6 h-6 animate-spin" />
    </div>
  ),
});
const ActiveSession = dynamic(() => import("./ActiveSession"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-6 h-6 animate-spin" />
    </div>
  ),
});

export default function CoupleDashboard({ coupleId }: { coupleId: string }) {
  const { user, logOut } = useAuth();
  const isMobile = useIsMobile();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeHash, setActiveHash] = useState("");

  useEffect(() => {
    setActiveHash(window.location.hash);
    const onHash = () => setActiveHash(window.location.hash);
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const sessionMatch = activeHash.match(/^#session\/(.+)$/);
  const sessionId = sessionMatch ? sessionMatch[1] : null;
  const isMemories = activeHash === "#memories";

  const handleUnpair = async () => {
    if (!user) return;
    if (!window.confirm("Disconnect from your partner? You'll need to pair again to see shared history.")) return;
    try {
      const coupleRef = doc(db, "couples", coupleId);
      const coupleSnap = await getDoc(coupleRef);
      const partnerId = coupleSnap.exists()
        ? coupleSnap.data().user1Id === user.uid
          ? coupleSnap.data().user2Id
          : coupleSnap.data().user1Id
        : null;

      await updateDoc(doc(db, "users", user.uid), { pairedCoupleId: null, updatedAt: Date.now() });
      if (partnerId) {
        await updateDoc(doc(db, "users", partnerId), { pairedCoupleId: null, updatedAt: Date.now() });
      }
      if (coupleSnap.exists()) await deleteDoc(coupleRef);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, "users", user);
    }
  };

  const navItems = (
    <>
      <a
        href="#"
        onClick={(e) => { e.preventDefault(); window.location.hash = ""; setIsMobileMenuOpen(false); }}
        className={`text-sm font-medium ${!sessionId && !isMemories ? "text-ink underline underline-offset-4" : "text-ink/60 hover:text-ink"}`}
      >
        Quizzes
      </a>
      <a
        href="#memories"
        onClick={() => setIsMobileMenuOpen(false)}
        className={`text-sm font-medium ${isMemories ? "text-ink underline underline-offset-4" : "text-ink/60 hover:text-ink"}`}
      >
        Memories
      </a>
      <button
        onClick={() => setIsChatOpen(true)}
        className="flex items-center gap-1.5 text-sm font-medium text-ink hover:text-ink/60 transition-colors"
      >
        <MessageCircle className="w-4 h-4" /> Chat
      </button>
    </>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="border-b border-hairline bg-canvas">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between gap-4">
          {/* Left: hamburger (mobile) or Logo */}
          <div className="flex items-center gap-4">
            {isMobile && (
              <button
                onClick={() => setIsMobileMenuOpen((v) => !v)}
                className="p-1 -ml-1 text-ink hover:text-ink/60 transition-colors"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}
            <Logo />
          </div>

          {/* Center: desktop nav */}
          <div className="hidden md:flex items-center gap-6">{navItems}</div>

          {/* Right: user + chat */}
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={() => setIsChatOpen(true)} className="md:hidden">
              <MessageCircle className="w-4 h-4" />
            </Button>
            <span className="caption text-ink/60 hidden sm:block">
              {user?.displayName || user?.email?.split("@")[0]}
            </span>
            <Button
              variant="tertiary"
              onClick={() => {
                if (window.confirm("Disconnect from your partner?")) void handleUnpair();
              }}
            >
              <UserMinus className="w-4 h-4" /> Disconnect
            </Button>
            <Button variant="tertiary" onClick={logOut}>
              <LogOut className="w-4 h-4" /> Log out
            </Button>
          </div>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      {isMobile && isMobileMenuOpen && (
        <div className="md:hidden border-b border-hairline bg-canvas">
          <div className="px-6 py-4 flex flex-col gap-4">{navItems}</div>
        </div>
      )}

      <main className="flex-1 w-full max-w-6xl mx-auto px-6 py-10">
        {isMemories ? (
          <MemoryBoard coupleId={coupleId} />
        ) : !sessionId ? (
          <div className="flex flex-col gap-10">
            <h1 className="text-4xl md:text-5xl font-light tracking-tight">
              Hi, {user?.displayName || user?.email?.split("@")[0]} 👋
            </h1>
            <p className="text-lg font-light text-ink/70">
              Pick a quiz to challenge your partner.
            </p>
            <QuizList coupleId={coupleId} />
          </div>
        ) : (
          <ActiveSession coupleId={coupleId} sessionId={sessionId} />
        )}
      </main>

      {isChatOpen && <ChatDrawer coupleId={coupleId} onClose={() => setIsChatOpen(false)} />}
    </div>
  );
}