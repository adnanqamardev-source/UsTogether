import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, addDoc, doc, setDoc, deleteDoc, limit } from '@/lib/firestore';
import { db } from "@/lib/firebase/client";
import { useAuth } from '@/components/providers';
import { Sparkles, Trash2, Flame } from "lucide-react";
import { handleFirestoreError, OperationType } from "@/lib/firestore-errors";
import QuizCardSkeleton from "./QuizCardSkeleton";
import QuizCard from "./QuizCard";
import {
  getRandomQuestions,
  toFirestoreQuizBatch,
  generateFallbackQuizMetadata,
} from "@/lib/quiz-data";
import { SectionHeader } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

function SectionHeaderWrapper({
  title,
  badge,
  icon: Icon,
  accent = "text-indigo-300",
}: {
  title: string;
  badge?: number;
  icon?: any;
  accent?: string;
}) {
  return <SectionHeader title={title} badge={badge} icon={Icon} accent={accent} />;
}

// A component to list quizzes and active sessions
export default function QuizList({ coupleId }: { coupleId: string }) {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeded, setSeeded] = useState(false);
  const [quizPage, setQuizPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [recentQuestionIds, setRecentQuestionIds] = useState<number[]>([]);

  useEffect(() => {
    if (!user || !coupleId) {
      setLoading(false);
      return;
    }

    const qb = query(
      collection(db, "quizzes"),
      where("isPublic", "==", true),
      limit(20),
    );
    const unsubQ = onSnapshot(
      qb,
      (snapshot) => {
        const q = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        setQuizzes(q);
        setHasMore(q.length >= 20);

        // Auto seed if empty and we haven't tried yet
        if (q.length === 0 && !seeded) {
          setSeeded(true);
          // Do not auto-generate via API right away to save costs, wait for user click.
        }
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, "quizzes");
      },
    );

    const qs = query(collection(db, `couples/${coupleId}/sessions`));
    const unsubS = onSnapshot(
      qs,
      (snapshot) => {
        setSessions(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      (err) => {
        handleFirestoreError(
          err,
          OperationType.LIST,
          `couples/${coupleId}/sessions`,
        );
      },
    );

    return () => {
      unsubQ();
      unsubS();
    };
  }, [coupleId, seeded, user]);

  const [generatingQuiz, setGeneratingQuiz] = useState(false);

  const fetchNewQuiz = async () => {
    if (!user) return;
    setGeneratingQuiz(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          recentTopics: recentQuestionIds.slice(-20),
          preferredCategory: undefined,
        }),
      });
      const data = await res.json();

      if (data.title && data.questions && data.questions.length > 0) {
        const quizRef = await addDoc(collection(db, "quizzes"), {
          creatorId: user.uid,
          title: data.title,
          description: data.description || "A brand new AI generated quiz.",
          isPublic: true,
          questions: data.questions,
          createdAt: Date.now(),
        });
        if (data.questionIds && Array.isArray(data.questionIds)) {
          setRecentQuestionIds((prev) => [...prev, ...data.questionIds]);
        }
      } else {
        const staticQs = getRandomQuestions(10, recentQuestionIds.slice(-50));
        if (staticQs.length > 0 && user) {
          const meta = generateFallbackQuizMetadata(staticQs);
          const quizData = toFirestoreQuizBatch(
            staticQs,
            meta.title,
            meta.description,
            user.uid,
          );
          await addDoc(collection(db, "quizzes"), {
            ...quizData,
            createdAt: Date.now(),
          });
          setRecentQuestionIds((prev) => [
            ...prev,
            ...staticQs.map((q) => q.id),
          ]);
        }
      }
    } catch (e) {
      console.error("Failed to fetch new quiz", e);
      try {
        const staticQs = getRandomQuestions(10, recentQuestionIds.slice(-50));
        if (staticQs.length > 0 && user) {
          const meta = generateFallbackQuizMetadata(staticQs);
          const quizData = toFirestoreQuizBatch(
            staticQs,
            meta.title,
            meta.description,
            user.uid,
          );
          await addDoc(collection(db, "quizzes"), {
            ...quizData,
            createdAt: Date.now(),
          });
          setRecentQuestionIds((prev) => [
            ...prev,
            ...staticQs.map((q) => q.id),
          ]);
        }
      } catch (fallbackErr) {
        console.error("Fallback also failed", fallbackErr);
      }
    } finally {
      setGeneratingQuiz(false);
    }
  };

  const startQuiz = async (quiz: any) => {
    if (!user) {
      window.alert("You must be logged in to start a quiz.");
      return;
    }
    try {
      // Force a fresh ID token so Firestore has current auth for security rules
      await user.getIdToken(true);

      const existing = sessions.find((s) => s.status !== "finished");
      if (existing) {
        window.location.hash = `#session/${existing.id}`;
        return;
      }

      if (
        !quiz.questions ||
        !Array.isArray(quiz.questions) ||
        quiz.questions.length === 0
      ) {
        window.alert("This quiz has no questions. Please try another quiz.");
        return;
      }

      const sessionRef = doc(collection(db, `couples/${coupleId}/sessions`));
      await setDoc(sessionRef, {
        coupleId,
        type: "quiz",
        status: "waiting",
        quizTitle: quiz.title || 'Untitled Quiz',
        state: {
          quizId: quiz.id,
          currentQuestion: 0,
          scores: {},
          answers: {},
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      window.location.hash = `#session/${sessionRef.id}`;
    } catch (e) {
      handleFirestoreError(
        e,
        OperationType.CREATE,
        `couples/${coupleId}/sessions`,
      );
    }
  };

  if (loading)
    return (
      <div className="space-y-8">
        <div className="h-8 w-40 bg-white/10 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <QuizCardSkeleton />
          <QuizCardSkeleton />
          <QuizCardSkeleton />
        </div>
      </div>
    );

  const deleteQuiz = async (e: React.MouseEvent, quizId: string) => {
    e.stopPropagation();
    if (!window.confirm("Delete this quiz?")) return;
    if (!user) {
      window.alert("You must be logged in to delete quizzes.");
      return;
    }
    try {
      await deleteDoc(doc(db, "quizzes", quizId));
    } catch (e: any) {
      console.error("Delete quiz error:", e);
      if (e.code === "permission-denied") {
        window.alert(
          "You do not have permission to delete this quiz. Only the creator can delete it.",
        );
      } else {
        window.alert("Could not delete this quiz. Please try again.");
      }
      handleFirestoreError(e, OperationType.DELETE, "quizzes", user);
    }
  };

  const deleteSession = async (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    if (!window.confirm("Delete this active session?")) return;
    try {
      await deleteDoc(doc(db, `couples/${coupleId}/sessions`, sessionId));
      if (window.location.hash === `#session/${sessionId}`) {
        window.location.hash = "";
      }
    } catch (e: any) {
      window.alert("Could not delete this session. Please try again.");
      handleFirestoreError(
        e,
        OperationType.DELETE,
        `couples/${coupleId}/sessions`,
        user,
      );
    }
  };

  const activeSessions = sessions.filter((s) => s.status !== "finished");

  return (
    <div className="space-y-12">
      {activeSessions.length > 0 && (
        <section>
          <div className="sticky top-0 z-20 bg-[#0F0A1F]/80 backdrop-blur-md border-b border-white/5 -mx-5 sm:-mx-10 px-5 sm:px-10 py-3 mb-6">
            <SectionHeaderWrapper
              title="Live Sessions"
              badge={activeSessions.length}
              icon={Flame}
              accent="text-green-400"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeSessions.map((s) => (
              <div
                key={s.id}
                onClick={() => (window.location.hash = `#session/${s.id}`)}
                className="relative bg-rose-500/10 border border-rose-500/30 p-5 rounded-3xl cursor-pointer hover:bg-rose-500/20 hover:scale-[1.02] transition-all duration-300 shadow-[0_0_15px_rgba(244,63,94,0.1)] hover:shadow-[0_0_25px_rgba(244,63,94,0.3)] group"
              >
                <div className="absolute top-4 right-4 z-10 transition-opacity">
                  <button
                    onClick={(e) => deleteSession(e, s.id)}
                    className="p-2 text-white/30 hover:text-rose-400 focus:outline-none transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <h3 className="font-bold text-rose-300 mb-1 flex items-center justify-between pr-8">
                  Game in Progress
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                    →
                  </span>
                </h3>
                <p className="text-xs text-rose-200/60 uppercase tracking-widest">
                  Tap to rejoin your partner
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="sticky top-0 z-20 bg-[#0F0A1F]/80 backdrop-blur-md border-b border-white/5 -mx-5 sm:-mx-10 px-5 sm:px-10 py-3 mb-6">
          <SectionHeaderWrapper title="Featured Quizzes" />
        </div>
        <div className="flex items-center justify-end mb-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchNewQuiz}
            isLoading={generatingQuiz}
          >
            <Sparkles className="w-3 h-3" />
            {generatingQuiz ? "..." : "Fetch New"}
          </Button>
        </div>

        {quizzes.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            title="No quizzes in the queue"
            description="Time for a chai break? Fetch a new quiz to get started."
            action={{
              label: "Fetch New Quiz",
              onClick: fetchNewQuiz,
            }}
          />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quizzes.map((q) => (
                <QuizCard
                  key={q.id}
                  quiz={q}
                  userId={user?.uid}
                  onStart={startQuiz}
                  onDelete={deleteQuiz}
                />
              ))}
            </div>
            {hasMore && (
              <div className="text-center mt-8">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setQuizPage((p) => p + 1)}
                >
                  Load More
                </Button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
