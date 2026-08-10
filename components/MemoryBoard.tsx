"use client";

import { useEffect, useState } from "react";
import { useAuth } from "./AuthProvider";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Sparkles, Loader2, Calendar } from "lucide-react";
import { handleFirestoreError, OperationType } from "@/lib/firestore-errors";
import Markdown from "react-markdown";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface FinishedSession {
  id: string;
  quizTitle: string;
  updatedAt?: number;
  state?: { answers?: Record<number, Record<string, unknown>> };
}

export default function MemoryBoard({ coupleId }: { coupleId: string }) {
  const { user } = useAuth();
  const [finishedSessions, setFinishedSessions] = useState<FinishedSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [challenge, setChallenge] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const fetchMemories = async () => {
      try {
        const qs = query(
          collection(db, `couples/${coupleId}/sessions`),
          where("status", "==", "finished")
        );
        const sn = await getDocs(qs);
        const quizzesSnap = await getDocs(collection(db, "quizzes"));
        const quizzesMap = new Map<string, { title?: string }>();
        quizzesSnap.forEach((d) => quizzesMap.set(d.id, d.data()));

        const sessions = sn.docs.map((d) => {
          const data = d.data();
          const quizId = data.state?.quizId;
          return {
            id: d.id,
            ...data,
            quizTitle: quizId ? quizzesMap.get(quizId)?.title || "A Quiz" : "Unknown Quiz",
          } as FinishedSession;
        });
        setFinishedSessions(sessions);
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, `couples/${coupleId}/sessions`, user);
      } finally {
        setLoading(false);
      }
    };
    fetchMemories();
  }, [coupleId, user]);

  const generateChallenge = async () => {
    setGenerating(true);
    setChallenge(null);
    try {
      const res = await fetch("/api/generate-challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          history: finishedSessions.map((s) => ({
            title: s.quizTitle,
            answers: s.state?.answers,
          })),
        }),
      });
      const data = await res.json();
      if (data.challenge) setChallenge(data.challenge);
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return <div className="text-center py-16 caption text-ink/50 animate-pulse">LOADING MEMORIES…</div>;
  }

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <p className="eyebrow text-sm mb-2 text-ink/50">MEMORIES</p>
          <h1 className="text-4xl font-light tracking-tight">Look back on your moments.</h1>
        </div>
        <Button variant="magenta" onClick={generateChallenge} disabled={generating}>
          {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {generating ? "Generating…" : "AI Challenge"}
        </Button>
      </div>

      {/* AI challenge display — lime color block */}
      {challenge && (
        <section className="color-block bg-block-lime text-ink">
          <p className="eyebrow text-sm mb-3 opacity-70">YOUR CUSTOM PROMPT</p>
          <div className="prose prose-pre:bg-black/10 prose-h1:text-ink prose-h2:text-ink prose-p:text-ink/80 prose-strong:text-ink">
            <Markdown>{challenge}</Markdown>
          </div>
        </section>
      )}

      {/* Finished sessions grid */}
      {finishedSessions.length === 0 ? (
        <Card size="lg" className="text-center py-16">
          <p className="text-ink/70 text-lg font-light">You haven't finished any quizzes yet.</p>
          <p className="text-sm text-ink/50 mt-2">Complete a quiz together and it'll show up here.</p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {finishedSessions.map((s) => (
            <Card
              key={s.id}
              size="lg"
              onClick={() => (window.location.hash = `#session/${s.id}`)}
              className="cursor-pointer hover:bg-surface-soft transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <Calendar className="w-5 h-5 text-ink/50" />
                <span className="caption text-ink/40">
                  {new Date(s.updatedAt || Date.now()).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
              <h3 className="font-medium text-lg mb-6">{s.quizTitle}</h3>
              <Button variant="secondary" fullWidth onClick={() => (window.location.hash = `#session/${s.id}`)}>
                View
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}