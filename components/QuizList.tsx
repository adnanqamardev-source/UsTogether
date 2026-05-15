import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './AuthProvider';
import { Play } from 'lucide-react';
import { handleFirestoreError, OperationType } from '@/lib/firestore-errors';

// A component to list quizzes and active sessions
export default function QuizList({ coupleId }: { coupleId: string }) {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const qb = query(collection(db, 'quizzes'), where('isPublic', '==', true));
    const unsubQ = onSnapshot(qb, (snapshot) => {
      setQuizzes(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    }, err => {
       handleFirestoreError(err, OperationType.LIST, 'quizzes', user);
    });

    const qs = query(collection(db, 'sessions'), where('coupleId', '==', coupleId));
    const unsubS = onSnapshot(qs, (snapshot) => {
       setSessions(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
       setLoading(false);
    }, err => {
       handleFirestoreError(err, OperationType.LIST, 'sessions', user);
    });

    return () => { unsubQ(); unsubS(); };
  }, [coupleId]);

  const createDummyQuizIfNone = async () => {
     if (user) { // Always allow generating these specific ones for the demo
        try {
           await addDoc(collection(db, 'quizzes'), {
              creatorId: user.uid,
              title: "The Great Indian Shaadi Debate",
              description: "Let's see if we agree on the chaos and magic of an Indian wedding.",
              isPublic: true,
              questions: [
                 { q: "If we had to elope tomorrow, where in India would we go?", options: ["Goa Beach", "Manali Mountains", "Udaipur Palace", "Kerala Houseboat"], a: 1 },
                 { q: "Which wedding function are you most excited to rock?", options: ["Sangeet/Haldi", "The Pheras", "The Reception Party", "Food Tasting"], a: 0 },
                 { q: "What's our ultimate comfort street food?", options: ["Pani Puri / Golgappa", "Vada Pav", "Chole Bhature", "Momos"], a: 0 },
              ],
              createdAt: Date.now()
           });
           await addDoc(collection(db, 'quizzes'), {
              creatorId: user.uid,
              title: "Future & Finances",
              description: "Getting serious about our goals, desi style.",
              isPublic: true,
              questions: [
                 { q: "What is your main financial priority right now?", options: ["Buying a house", "Traveling the world", "Starting a business", "Investing for early retirement"], a: 3 },
                 { q: "How do you feel about living in a joint family in the future?", options: ["Love it, the more the merier", "Needs clear boundaries", "Nuclear family only", "Open to trying it out"], a: 1 },
                 { q: "What's the ideal weekend plan?", options: ["Binge-watching on Netflix", "Long drive outside the city", "Visiting relatives/parents", "Exploring a new cafe"], a: 3 },
              ],
              createdAt: Date.now()
           });
        } catch(e) {
           handleFirestoreError(e, OperationType.CREATE, 'quizzes', user);
        }
     }
  };

  const startQuiz = async (quiz: any) => {
     try {
       const existing = sessions.find(s => s.status !== 'finished');
       if (existing) {
          window.location.hash = `#session/${existing.id}`;
          return;
       }

       const sessionRef = doc(collection(db, 'sessions'));
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
        handleFirestoreError(e, OperationType.CREATE, 'sessions', user);
     }
  };

  if (loading) return <div className="text-indigo-200 animate-pulse">Loading games...</div>;

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
                <div key={s.id} onClick={() => window.location.hash = `#session/${s.id}`} className="bg-rose-500/10 border border-rose-500/30 p-5 rounded-3xl cursor-pointer hover:bg-rose-500/20 transition-all shadow-[0_0_15px_rgba(244,63,94,0.1)] group">
                   <h3 className="font-bold text-rose-300 mb-1 flex items-center justify-between">
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
           <button onClick={createDummyQuizIfNone} className="text-xs font-bold uppercase tracking-[0.2em] text-rose-400 hover:text-rose-300 transition-colors">
             Generate Examples
           </button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {quizzes.map(q => (
             <div key={q.id} className="bg-white/5 p-6 rounded-[2rem] border border-white/10 shadow-lg hover:bg-white/10 transition-all flex flex-col h-full group backdrop-blur-md">
                <h3 className="font-serif italic text-xl mb-3 text-[#F8FAFC]">{q.title}</h3>
                <p className="text-indigo-200/60 text-sm mb-6 flex-1">{q.description}</p>
                <button onClick={() => startQuiz(q)} className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-indigo-500/20 text-indigo-100 font-bold hover:bg-indigo-500/40 border border-indigo-500/30 transition-all group-hover:border-indigo-400/50">
                  <Play className="w-4 h-4" />
                  Start Quiz
                </button>
             </div>
          ))}
        </div>
      </section>
    </div>
  );
}
