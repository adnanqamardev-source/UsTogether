"use client";

import { useState, useEffect, useCallback } from "react";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "./AuthProvider";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { handleFirestoreError, OperationType } from "@/lib/firestore-errors";

interface Session {
  id: string;
  coupleId: string;
  type: string;
  status: string;
  state: {
    quizId: string;
    currentQuestion: number;
    answers: Record<number, Record<string, unknown>>;
  };
}

interface Quiz {
  id: string;
  title: string;
  questions: Array<{
    type?: "choice" | "text";
    q: string;
    options?: string[];
    a?: number;
  }>;
}

export default function ActiveSession({
  coupleId,
  sessionId,
}: {
  coupleId: string;
  sessionId: string;
}) {
  const { user } = useAuth();
  const [session, setSession] = useState<Session | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [textAnswer, setTextAnswer] = useState("");

  useEffect(() => {
    if (!sessionId) return;
    const unsub = onSnapshot(
      doc(db, `couples/${coupleId}/sessions/${sessionId}`),
      (snap) => {
        if (snap.exists()) setSession({ id: snap.id, ...(snap.data() as any) });
      },
      (err) => handleFirestoreError(err, OperationType.GET, `couples/${coupleId}/sessions/${sessionId}`, user)
    );
    return () => unsub();
  }, [coupleId, sessionId, user]);

  useEffect(() => {
    if (!session?.state?.quizId || quiz) return;
    const unsub = onSnapshot(
      doc(db, "quizzes", session.state.quizId),
      (snap) => {
        if (snap.exists()) setQuiz({ id: snap.id, ...(snap.data() as any) });
      },
      (err) => handleFirestoreError(err, OperationType.GET, `quizzes/${session.state.quizId}`, user)
    );
    return () => unsub();
  }, [session?.state?.quizId, quiz, user]);

  // Reset the draft text answer when moving to a new question.
  const currentQIndex = session?.state?.currentQuestion ?? 0;
  useEffect(() => {
    setTextAnswer("");
  }, [currentQIndex]);

  // Derive pair state from the couple doc path / answers (all safe with defaults).
  const partnerId = session?.coupleId?.split("_").find((id) => id !== user?.uid) || "";
  const answers = session?.state?.answers ?? {};
  const myAnswer = currentQIndex !== undefined ? answers[currentQIndex]?.[user?.uid ?? ""] : undefined;
  const partnerAnswer =
    partnerId && currentQIndex !== undefined
      ? answers[currentQIndex]?.[partnerId]
      : undefined;
  const bothAnswered = myAnswer !== undefined && partnerAnswer !== undefined;

  const handleAnswer = useCallback(
    async (value: unknown) => {
      if (!user || !sessionId) return;
      if (myAnswer !== undefined) return;
      try {
        const newAnswers = { ...answers };
        if (!newAnswers[currentQIndex]) newAnswers[currentQIndex] = {};
        newAnswers[currentQIndex][user.uid] = value;
        await updateDoc(doc(db, `couples/${coupleId}/sessions/${sessionId}`), {
          "state.answers": newAnswers,
          updatedAt: Date.now(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `couples/${coupleId}/sessions/${sessionId}`, user);
      }
    },
    [answers, currentQIndex, coupleId, myAnswer, sessionId, user]
  );

  const isFinished = session?.status === "finished";
  if (!session || !quiz || !user) {
    return <div className="text-center py-16 caption text-ink/50 animate-pulse">LOADING SESSION…</div>;
  }

  const question = quiz.questions[currentQIndex];
  const isDone = isFinished || currentQIndex >= quiz.questions.length;

  const nextQuestion = async () => {
    if (currentQIndex + 1 >= quiz.questions.length) {
      await updateDoc(doc(db, `couples/${coupleId}/sessions/${sessionId}`), {
        status: "finished",
        updatedAt: Date.now(),
      });
    } else {
      await updateDoc(doc(db, `couples/${coupleId}/sessions/${sessionId}`), {
        "state.currentQuestion": currentQIndex + 1,
        updatedAt: Date.now(),
      });
    }
  };

  // ---- Finished / results view ----
  if (isDone) {
    return (
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-light tracking-tight">Quiz finished!</h1>
          <p className="text-lg text-ink/70">
            You completed “{quiz.title}”. Here's how your answers lined up.
          </p>
        </div>

        {/* Score summary */}
        <div className="flex justify-center gap-6">
          <Card size="lg" className="text-center">
            <p className="eyebrow text-sm mb-2">MATCHES</p>
            <p className="text-4xl font-medium">
              {quiz.questions.filter((_, i) => {
                const a = answers[i]?.[user.uid];
                const b = partnerId ? answers[i]?.[partnerId] : undefined;
                return a !== undefined && b !== undefined && a === b;
              }).length}
            </p>
          </Card>
          <Card size="lg" className="text-center">
            <p className="eyebrow text-sm mb-2">OF</p>
            <p className="text-4xl font-medium">{quiz.questions.length}</p>
          </Card>
        </div>

        <div className="space-y-4">
          {quiz.questions.map((q, i) => {
            const m = answers[i]?.[user.uid];
            const p = partnerId ? answers[i]?.[partnerId] : undefined;
            const resolve = (v: unknown) => {
              if (v === undefined) return "—";
              if (typeof v === "number") return q.options?.[v] ?? String(v);
              return String(v);
            };
            return (
              <Card key={i} size="lg">
                <p className="font-medium mb-3">
                  {i + 1}. {q.q}
                </p>
                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="caption text-ink/50 mb-1">YOU</p>
                    <p>{resolve(m)}</p>
                  </div>
                  <div>
                    <p className="caption text-ink/50 mb-1">PARTNER</p>
                    <p>{resolve(p)}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="text-center">
          <Button variant="secondary" onClick={() => (window.location.hash = "")}>
            Back to dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="font-medium">{quiz.title}</h2>
        <span className="caption text-ink/50">
          Q{currentQIndex + 1} / {quiz.questions.length}
        </span>
      </div>

      <Card size="lg">
        <h3 className="text-2xl font-light tracking-tight mb-6">{question.q}</h3>

        {question.type === "text" || !question.options ? (
          <div className="space-y-4">
            {myAnswer === undefined ? (
              <>
                <textarea
                  value={textAnswer}
                  onChange={(e) => setTextAnswer(e.target.value)}
                  placeholder="Type your thoughts…"
                  className="w-full bg-canvas text-ink rounded-md px-3.5 py-3 border border-hairline placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-ink resize-none min-h-[120px]"
                />
                <div className="flex justify-end">
                  <Button
                    onClick={() => textAnswer.trim() && handleAnswer(textAnswer.trim())}
                    disabled={!textAnswer.trim()}
                  >
                    Submit
                  </Button>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="caption text-ink/50 mb-1">YOUR ANSWER</p>
                  <p className="text-lg">{myAnswer as string}</p>
                </div>
                {bothAnswered && (
                  <div>
                    <p className="caption text-ink/50 mb-1">PARTNER'S ANSWER</p>
                    <p className="text-lg">{partnerAnswer as string}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="grid gap-3">
            {question.options?.map((opt, i) => {
              const selected = myAnswer === i;
              const partnerSelected = bothAnswered && partnerAnswer === i;
              return (
                <button
                  key={i}
                  disabled={myAnswer !== undefined}
                  onClick={() => handleAnswer(i)}
                  className={`text-left px-4 py-3 rounded-md border transition-colors ${
                    selected
                      ? "bg-ink text-canvas border-ink"
                      : "bg-canvas border-hairline hover:border-ink/40"
                  } ${myAnswer !== undefined && !selected ? "opacity-40" : ""}`}
                >
                  <span className="flex items-center justify-between gap-3">
                    <span>
                      <span className="font-medium mr-2">{String.fromCharCode(65 + i)}.</span>
                      {opt}
                    </span>
                    {partnerSelected && (
                      <span className="caption text-[10px] bg-canvas text-ink px-2 py-0.5 rounded-full">
                        PARTNER
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        <div className="mt-8 flex items-center justify-center min-h-[48px]">
          {myAnswer === undefined ? (
            <p className="caption text-ink/50 animate-pulse">WAITING FOR YOUR ANSWER…</p>
          ) : partnerAnswer === undefined ? (
            <p className="caption text-ink/50 animate-pulse">WAITING FOR PARTNER…</p>
          ) : (
            <Button onClick={nextQuestion}>
              {currentQIndex + 1 >= quiz.questions.length ? "Finish" : "Next →"}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}