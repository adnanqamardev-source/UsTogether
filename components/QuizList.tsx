"use client";

import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, addDoc, doc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "./AuthProvider";
import { Play, Sparkles, Trash2 } from "lucide-react";
import { handleFirestoreError, OperationType } from "@/lib/firestore-errors";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function QuizList({ coupleId }: { coupleId: string }) {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const unsubQ = onSnapshot(
      query(collection(db, "quizzes"), where("isPublic", "==", true)),
      (snap) => {
        setQuizzes(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      },
      (err) => handleFirestoreError(err, OperationType.LIST, "quizzes", user)
    );

    const unsubS = onSnapshot(
      collection(db, `couples/${coupleId}/sessions`),
      (snap) => {
        setSessions(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, `couples/${coupleId}/sessions`, user)
    );

    return () => {
      unsubQ();
      unsubS();
    };
  }, [coupleId, user]);

  const generateQuiz = async () => {
    if (!user) return;
    setGenerating(true);
    try {
      const res = await fetch("/api/generate-quiz", { method: "POST" });
      const data = await res.json();
      if (data.title && data.questions) {
        await addDoc(collection(db, "quizzes"), {
          creatorId: user.uid,
          title: data.title,
          description: data.description || "An AI-generated quiz.",
          isPublic: true,
          questions: data.questions,
          createdAt: Date.now(),
        });
      }
    } catch (err) {
      console.error("Failed to generate quiz:", err);
    } finally {
      setGenerating(false);
    }
  };

  const startQuiz = async (quiz: any) => {
    try {
      const existing = sessions.find((s) => s.status !== "finished");
      if (existing) {
        window.location.hash = `#session/${existing.id}`;
        return;
      }
      const sessionRef = doc(collection(db, `couples/${coupleId}/sessions`));
      await setDoc(sessionRef, {
        coupleId,
        type: "quiz",
        status: "playing",
        state: {
          quizId: quiz.id,
          currentQuestion: 0,
          answers: {},
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      window.location.hash = `#session/${sessionRef.id}`;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `couples/${coupleId}/sessions`, user);
    }
  };

  const deleteQuiz = async (e: React.MouseEvent, quizId: string) => {
    e.stopPropagation();
    if (!window.confirm("Delete this quiz?")) return;
    try {
      await deleteDoc(doc(db, "quizzes", quizId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, "quizzes", user);
    }
  };

  if (loading) {
    return <div className="text-center py-10 caption text-ink/50 animate-pulse">LOADING QUIZZES…</div>;
  }

  const activeSessions = sessions.filter((s) => s.status !== "finished");

  return (
    <div className="space-y-12">
      {/* Active sessions */}
      {activeSessions.length > 0 && (
        <section>
          <h2 className="eyebrow text-sm mb-4">LIVE SESSIONS</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {activeSessions.map((s) => (
              <Card
                key={s.id}
                size="md"
                onClick={() => (window.location.hash = `#session/${s.id}`)}
                className="cursor-pointer hover:bg-surface-soft transition-colors flex items-center justify-between"
              >
                <div>
                  <p className="font-medium">Game in progress</p>
                  <p className="text-sm text-ink/60">Tap to rejoin</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm("Delete this session?")) {
                      deleteDoc(doc(db, `couples/${coupleId}/sessions`, s.id)).catch((err) =>
                        handleFirestoreError(err, OperationType.DELETE, `couples/${coupleId}/sessions`, user)
                      );
                    }
                  }}
                  className="p-2 text-ink/30 hover:text-accent-magenta transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Generate + Quiz grid */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="eyebrow text-sm">FEATURED QUIZZES</h2>
          <Button variant="tertiary" onClick={generateQuiz} disabled={generating}>
            <Sparkles className="w-4 h-4" />
            {generating ? "Generating…" : "Fetch new"}
          </Button>
        </div>

        {quizzes.length === 0 ? (
          <Card size="lg" className="text-center py-16">
            <p className="text-ink/70 mb-4">No quizzes yet.</p>
            <Button variant="secondary" onClick={generateQuiz} disabled={generating}>
              <Sparkles className="w-4 h-4" />
              {generating ? "Generating…" : "Generate one"}
            </Button>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {quizzes.map((q) => {
              const isOwn = q.creatorId === user?.uid;
              return (
                <Card
                  key={q.id}
                  size="lg"
                  onClick={() => startQuiz(q)}
                  className="cursor-pointer hover:border-ink/30 transition-colors flex flex-col justify-between group relative"
                >
                  {isOwn && (
                    <button
                      onClick={(e) => deleteQuiz(e, q.id)}
                      className="absolute top-3 right-3 p-1 text-ink/40 hover:text-accent-magenta transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <div>
                    <h3 className="font-medium text-xl mb-2">{q.title}</h3>
                    <p className="text-sm text-ink/60 line-clamp-3">{q.description}</p>
                  </div>
                  <div className="mt-6">
                    <Button variant="secondary" fullWidth>
                      <Play className="w-4 h-4" /> Start
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}