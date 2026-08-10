"use client";

import { useState, FormEvent } from "react";
import { useAuth } from "./AuthProvider";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Logo } from "@/components/ui/Logo";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { handleFirestoreError, OperationType } from "@/lib/firestore-errors";
import dynamic from "next/dynamic";

const CoupleDashboard = dynamic(() => import("./CoupleDashboard"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center">
      <span className="caption text-ink/50 animate-pulse">LOADING YOUR SPACE…</span>
    </div>
  ),
});

export default function Dashboard() {
  const { user, dbUser, myCode, logOut } = useAuth();
  const [partnerCode, setPartnerCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Already paired → render the couple workspace.
  if (dbUser?.pairedCoupleId) {
    return <CoupleDashboard coupleId={dbUser.pairedCoupleId} />;
  }

  const handlePair = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (!user || !partnerCode.trim()) return;
    const codeStr = partnerCode.trim().toUpperCase();
    if (codeStr === myCode) {
      setErrorMsg("You can't pair with yourself.");
      return;
    }

    setLoading(true);
    try {
      const codeDocRef = doc(db, "pairingCodes", codeStr);
      const codeDoc = await getDoc(codeDocRef);
      if (!codeDoc.exists()) {
        setErrorMsg("That pairing code doesn't exist. Check it and try again.");
        return;
      }
      const partnerId = codeDoc.data().userId;
      const coupleId = [user.uid, partnerId].sort().join("_");
      const coupleRef = doc(db, "couples", coupleId);
      const coupleSnap = await getDoc(coupleRef);

      if (!coupleSnap.exists()) {
        await setDoc(coupleRef, {
          user1Id: user.uid < partnerId ? user.uid : partnerId,
          user2Id: user.uid > partnerId ? user.uid : partnerId,
          status: "active",
          totalScore: 0,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      }

      // Mark both users paired. The onSnapshot in AuthProvider flips the view.
      await updateDoc(doc(db, "users", user.uid), {
        pairedCoupleId: coupleId,
        updatedAt: Date.now(),
      });
      await updateDoc(doc(db, "users", partnerId), {
        pairedCoupleId: coupleId,
        updatedAt: Date.now(),
      });
    } catch (err) {
      setErrorMsg(handleFirestoreError(err, OperationType.UPDATE, "couples", user));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="border-b border-hairline bg-canvas">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-4">
            <span className="caption hidden sm:block text-ink/60">
              {user?.displayName || user?.email?.split("@")[0]}
            </span>
            <Button variant="tertiary" onClick={logOut}>
              Log out
            </Button>
          </div>
        </div>
      </nav>

      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md flex flex-col gap-8">
          <div className="text-center flex flex-col items-center gap-4">
            <h1 className="text-4xl md:text-5xl font-light tracking-tight">
              Connect with your partner
            </h1>
            <p className="text-lg font-light text-ink/70">
              Share your code, or enter theirs — then play together in real time.
            </p>
          </div>

          {/* Your code — navy color block */}
          <section className="color-block bg-block-navy text-inverse-ink text-center">
            <p className="eyebrow text-sm mb-3 opacity-70">YOUR CODE</p>
            <p className="font-mono text-3xl md:text-4xl tracking-[0.15em]">
              {myCode || "…"}
            </p>
          </section>

          <form onSubmit={handlePair} className="flex flex-col gap-4">
            <Input
              label="Partner code"
              type="text"
              value={partnerCode}
              onChange={(e) => setPartnerCode(e.target.value)}
              placeholder="ABCD1234"
              maxLength={8}
              autoCapitalize="characters"
              autoCorrect="off"
            />
            <Button type="submit" disabled={loading || !partnerCode.trim()} fullWidth>
              {loading ? "Pairing…" : "Connect"}
            </Button>
          </form>

          {errorMsg && <p className="text-sm text-accent-magenta text-center">{errorMsg}</p>}
        </div>
      </main>
    </div>
  );
}