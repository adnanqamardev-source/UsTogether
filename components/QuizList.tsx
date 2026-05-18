import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './AuthProvider';
import { Play, Sparkles, Trash2 } from 'lucide-react';
import { handleFirestoreError, OperationType } from '@/lib/firestore-errors';

// A component to list quizzes and active sessions
export default function QuizList({ coupleId }: { coupleId: string }) {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeded, setSeeded] = useState(false);

  useEffect(() => {
    const qb = query(collection(db, 'quizzes'), where('isPublic', '==', true));
    const unsubQ = onSnapshot(qb, (snapshot) => {
      const q = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setQuizzes(q);
      
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
       });
       const data = await res.json();
       
       if (data.title && data.questions) {
           await addDoc(collection(db, 'quizzes'), {
              creatorId: user.uid,
              title: data.title,
              description: data.description || 'A brand new AI generated quiz.',
              isPublic: true,
              questions: data.questions,
              createdAt: Date.now()
           });
       } else {
           // Fallback if AI fails
           console.log("AI Failed to generate, falling back.", data);
       }
     } catch (e) {
       console.error("Failed to fetch new quiz", e);
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

      const sessionRef = doc(collection(db, `couples/${coupleId}/sessions`));
       await setDoc(sessionRef, {
          coupleId,
          type: 'quiz',
          status: 'waiting', 
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

  if (loading) return <div className="text-indigo-200 animate-pulse">Loading games...</div>;

  const deleteQuiz = async (e: React.MouseEvent, quizId: string) => {
    e.stopPropagation();
    if (!window.confirm("Delete this quiz?")) return;
    try {
      await deleteDoc(doc(db, 'quizzes', quizId));
    } catch (e: any) {
      window.alert('Could not delete this quiz. You can only delete quizzes you created.');
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

  return (
    <div className="space-y-8">
      {sessions.filter(s => s.status !== 'finished').length > 0 && (
        <section>
          <h2 className="text-sm font-bold uppercase tracking-[0.2em] mb-4 text-green-400 flex items-center gap-2">
             <span className="w-2 h-2 rounded-full bg-green-500 animate-[pulse_1s_infinite]" />
             Live Sessions
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
             {sessions.filter(s => s.status !== 'finished').map(s => (
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
        <div className="flex items-center justify-between mb-6">
           <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-300">Featured Quizzes</h2>
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
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {quizzes.map(q => (
               <div key={q.id} className="relative bg-white/5 p-6 rounded-[2rem] border border-white/10 shadow-lg hover:shadow-[0_0_30px_rgba(244,63,94,0.3)] hover:scale-105 hover:bg-rose-500/10 hover:border-rose-500/30 transition-all duration-300 flex flex-col h-full group backdrop-blur-md">
                  {q.creatorId === user?.uid && (
                    <div className="absolute top-4 right-4 z-10 transition-opacity">
                      <button onClick={(e) => deleteQuiz(e, q.id)} className="p-2 text-white/30 hover:text-rose-400 focus:outline-none transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  <div className="flex-1 cursor-pointer flex flex-col h-full" onClick={() => startQuiz(q)}>
                    <h3 className="font-serif italic text-xl mb-3 text-[#F8FAFC] group-hover:text-rose-300 transition-colors pr-8">{q.title}</h3>
                    <p className="text-indigo-200/60 text-sm mb-6 flex-1 line-clamp-3">{q.description}</p>
                    <button className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-indigo-500/20 text-indigo-100 font-bold group-hover:bg-rose-500/50 border border-indigo-500/30 transition-all group-hover:border-rose-400/80 group-hover:text-white">
                      <Play className="w-4 h-4" />
                      Start Quiz
                    </button>
                  </div>
               </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
