import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, doc, setDoc, deleteDoc, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './AuthProvider';
import { Sparkles, Trash2, Flame } from 'lucide-react';
import { handleFirestoreError, OperationType } from '@/lib/firestore-errors';
import QuizCardSkeleton from './QuizCardSkeleton';
import QuizCard from './QuizCard';
import { getRandomQuestions, toFirestoreQuizBatch, generateFallbackQuizMetadata } from '@/lib/quiz-data';

function SectionHeader({ title, badge, icon: Icon, accent = "text-indigo-300" }: { title: string; badge?: number; icon?: any; accent?: string }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h2 className={`text-xs font-bold uppercase tracking-[0.2em] ${accent} flex items-center gap-2`}>
        {Icon && <Icon className="w-4 h-4" />}
        {title}
        {badge !== undefined && (
          <span className="ml-2 inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-white border border-white/10">
            {badge}
          </span>
        )}
      </h2>
    </div>
  );
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
    const qb = query(collection(db, 'quizzes'), where('isPublic', '==', true), limit(20));
    const unsubQ = onSnapshot(qb, (snapshot) => {
      const q = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setQuizzes(q);
      setHasMore(q.length >= 20);

      // Auto seed if empty and we haven't tried yet
      if (q.length === 0 && !seeded) {
         setSeeded(true);
         // Do not auto-generate via API right away to save costs, wait for user click.
      }
    }, err => {
       handleFirestoreError(err, OperationType.LIST, 'quizzes');
    });

    const qs = query(collection(db, `couples/${coupleId}/sessions`));
    const unsubS = onSnapshot(qs, (snapshot) => {
       setSessions(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
       setLoading(false);
    }, err => {
       handleFirestoreError(err, OperationType.LIST, `couples/${coupleId}/sessions`);
    });

    return () => { unsubQ(); unsubS(); };
  }, [coupleId, seeded]);

  const [generatingQuiz, setGeneratingQuiz] = useState(false);

  const fetchNewQuiz = async () => {
     if (!user) return;
     setGeneratingQuiz(true);
     try {
       const res = await fetch('/api/generate-quiz', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
           recentTopics: recentQuestionIds.slice(-20),
           preferredCategory: undefined,
         }),
       });
       const data = await res.json();

       if (data.title && data.questions && data.questions.length > 0) {
         const quizRef = await addDoc(collection(db, 'quizzes'), {
            creatorId: user.uid,
            title: data.title,
            description: data.description || 'A brand new AI generated quiz.',
            isPublic: true,
            questions: data.questions,
            createdAt: Date.now()
         });
         if (data.questionIds && Array.isArray(data.questionIds)) {
           setRecentQuestionIds(prev => [...prev, ...data.questionIds]);
         }
        } else {
          const staticQs = getRandomQuestions(10, recentQuestionIds.slice(-50));
          if (staticQs.length > 0 && user) {
            const meta = generateFallbackQuizMetadata(staticQs);
            const quizData = toFirestoreQuizBatch(staticQs, meta.title, meta.description, user.uid);
            await addDoc(collection(db, 'quizzes'), {
              ...quizData,
              createdAt: Date.now()
            });
            setRecentQuestionIds(prev => [...prev, ...staticQs.map(q => q.id)]);
          }
        }
     } catch (e) {
       console.error("Failed to fetch new quiz", e);
        try {
          const staticQs = getRandomQuestions(10, recentQuestionIds.slice(-50));
          if (staticQs.length > 0 && user) {
            const meta = generateFallbackQuizMetadata(staticQs);
            const quizData = toFirestoreQuizBatch(staticQs, meta.title, meta.description, user.uid);
            await addDoc(collection(db, 'quizzes'), {
              ...quizData,
              createdAt: Date.now()
            });
            setRecentQuestionIds(prev => [...prev, ...staticQs.map(q => q.id)]);
          }
        } catch (fallbackErr) {
         console.error("Fallback also failed", fallbackErr);
       }
     } finally {
       setGeneratingQuiz(false);
     }
  };

  const startQuiz = async (quiz: any) => {
     try {
       const existing = sessions.find(s => s.status !== 'finished');
       if (existing) {
          window.location.hash = `#session/${existing.id}`;
          return;
       }

       if (!quiz.questions || !Array.isArray(quiz.questions) || quiz.questions.length === 0) {
         window.alert('This quiz has no questions. Please try another quiz.');
         return;
       }

      const sessionRef = doc(collection(db, `couples/${coupleId}/sessions`));
        await setDoc(sessionRef, {
           coupleId,
           type: 'quiz',
           status: 'waiting',
           quizTitle: quiz.title,
           state: {
              quizId: quiz.id,
              currentQuestion: 0,
              scores: {},
              answers: {}
           },
           createdAt: Date.now(),
           updatedAt: Date.now(),
        });
       window.location.hash = `#session/${sessionRef.id}`;
     } catch (e) {
        handleFirestoreError(e, OperationType.CREATE, `couples/${coupleId}/sessions`);
     }
  };

  if (loading) return (
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
      window.alert('You must be logged in to delete quizzes.');
      return;
    }
    try {
      await deleteDoc(doc(db, 'quizzes', quizId));
    } catch (e: any) {
      console.error('Delete quiz error:', e);
      if (e.code === 'permission-denied') {
        window.alert('You do not have permission to delete this quiz. Only the creator can delete it.');
      } else {
        window.alert('Could not delete this quiz. Please try again.');
      }
      handleFirestoreError(e, OperationType.DELETE, 'quizzes', user);
    }
  };

  const deleteSession = async (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    if (!window.confirm("Delete this active session?")) return;
    try {
      await deleteDoc(doc(db, `couples/${coupleId}/sessions`, sessionId));
      if (window.location.hash === `#session/${sessionId}`) {
        window.location.hash = '';
      }
    } catch (e: any) {
      window.alert('Could not delete this session. Please try again.');
      handleFirestoreError(e, OperationType.DELETE, `couples/${coupleId}/sessions`, user);
    }
  };

  const activeSessions = sessions.filter(s => s.status !== 'finished');

  return (
    <div className="space-y-12">
      {activeSessions.length > 0 && (
        <section>
          <SectionHeader title="Live Sessions" badge={activeSessions.length} icon={Flame} accent="text-green-400" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {activeSessions.map(s => (
                <div key={s.id} onClick={() => window.location.hash = `#session/${s.id}`} className="relative bg-rose-500/10 border border-rose-500/30 p-5 rounded-3xl cursor-pointer hover:bg-rose-500/20 hover:scale-[1.02] transition-all duration-300 shadow-[0_0_15px_rgba(244,63,94,0.1)] hover:shadow-[0_0_25px_rgba(244,63,94,0.3)] group">
                   <div className="absolute top-4 right-4 z-10 transition-opacity">
                    <button onClick={(e) => deleteSession(e, s.id)} className="p-2 text-white/30 hover:text-rose-400 focus:outline-none transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <h3 className="font-bold text-rose-300 mb-1 flex items-center justify-between pr-8">
                    Game in Progress
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                  </h3>
                  <p className="text-xs text-rose-200/60 uppercase tracking-widest">Tap to rejoin your partner</p>
               </div>
             ))}
          </div>
        </section>
      )}

      <section>
        <SectionHeader title="Featured Quizzes" />
        <div className="flex items-center justify-end mb-2">
           <button onClick={fetchNewQuiz} disabled={generatingQuiz} className="text-xs font-bold uppercase tracking-[0.2em] text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-2">
             <Sparkles className="w-3 h-3" /> {generatingQuiz ? '...' : 'Fetch New'}
           </button>
        </div>
        
        {quizzes.length === 0 ? (
           <div className="text-center p-10 border border-white/10 rounded-3xl bg-white/5">
             <p className="text-indigo-200 mb-4 font-light">Loading quizzes or no quizzes available...</p>
             <button onClick={fetchNewQuiz} disabled={generatingQuiz} className="bg-indigo-500 hover:bg-indigo-400 text-white font-bold py-2 px-6 rounded-full text-sm uppercase tracking-widest transition-all">{generatingQuiz ? 'Generating...' : 'Reload Quizzes'}</button>
           </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quizzes.map(q => (
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
                <button
                  onClick={() => setQuizPage(p => p + 1)}
                  className="bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-8 rounded-full text-sm uppercase tracking-widest transition-all border border-white/10"
                >
                  Load More
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
