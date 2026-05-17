import { useEffect, useState } from 'react';
import { useAuth } from './AuthProvider';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Images, Calendar, Sparkles, Loader } from 'lucide-react';
import { handleFirestoreError, OperationType } from '@/lib/firestore-errors';
import Markdown from 'react-markdown';

export default function MemoryBoard({ coupleId }: { coupleId: string }) {
  const { user } = useAuth();
  const [finishedSessions, setFinishedSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [challenge, setChallenge] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const fetchMemories = async () => {
      try {
        const qs = query(collection(db, `couples/${coupleId}/sessions`), where('status', '==', 'finished'));
        const sn = await getDocs(qs);
        // We also need the quiz details to show title.
        // We can fetch quizzes or store titles on session. Oh wait, we don't store quiz title on the session.
        // Let's just fetch all quizzes to map them.
        const quizzesSnap = await getDocs(collection(db, 'quizzes'));
        const quizzesMap = new Map();
        quizzesSnap.forEach(d => quizzesMap.set(d.id, d.data()));

        const sessions = sn.docs.map(d => {
          const data = d.data();
          const quizId = data.state?.quizId;
          return { id: d.id, ...data, quizTitle: quizId ? quizzesMap.get(quizId)?.title || 'A Quiz' : 'Unknown Quiz' };
        });

        // wait, does session store quizId? Let's check QuizList to see how we start a session.
        
        setFinishedSessions(sessions);
      } catch (e: any) {
         handleFirestoreError(e, OperationType.LIST, `couples/${coupleId}/sessions (Memories)`);
      } finally {
        setLoading(false);
      }
    };
    fetchMemories();
  }, [coupleId]);

  const generateChallenge = async () => {
    setGenerating(true);
    setChallenge(null);
    try {
      const res = await fetch('/api/generate-challenge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          history: finishedSessions.map(s => ({ title: s.quizTitle, answers: s.state?.answers }))
        })
      });
      const data = await res.json();
      if (data.challenge) {
        setChallenge(data.challenge);
      } else {
        alert("Failed to generate challenge: " + data.error);
      }
    } catch (e) {
      console.error(e);
      alert("Something went wrong");
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return <div className="text-indigo-200 text-center py-20 font-light animate-pulse">Loading memories...</div>;

  return (
    <div className="w-full pb-20">
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
         <div>
           <h1 className="text-4xl md:text-5xl font-serif italic mb-4 text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-indigo-400">Memory Board</h1>
           <p className="text-indigo-200/60 font-light">Look back on your shared moments and answers.</p>
         </div>
         <button 
           onClick={generateChallenge} 
           disabled={generating}
           className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white px-6 py-3 rounded-full text-sm font-bold uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] disabled:opacity-50"
         >
           {generating ? <Loader className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
           <span>AI Challenge</span>
         </button>
      </header>

      {challenge && (
        <div className="mb-12 bg-indigo-500/10 border border-indigo-500/30 p-6 md:p-8 rounded-[2rem] shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-20">
             <Sparkles className="w-20 h-20 text-indigo-300" />
          </div>
          <h2 className="text-2xl font-serif italic text-indigo-300 mb-4 flex items-center gap-3">
             <Sparkles className="w-6 h-6" /> Your Custom Prompt
          </h2>
          <div className="prose prose-invert prose-indigo">
             <Markdown>{challenge}</Markdown>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {finishedSessions.length === 0 ? (
           <div className="col-span-full text-center py-20 bg-white/5 border border-white/10 rounded-3xl">
              <Images className="w-12 h-12 text-indigo-400/50 mx-auto mb-4" />
              <p className="text-indigo-200/50">You haven't finished any quizzes yet.</p>
           </div>
         ) : (
           finishedSessions.map(s => (
             <div key={s.id} className="bg-white/5 p-6 rounded-[2rem] border border-white/10 shadow-lg flex flex-col items-center">
                 <Calendar className="w-8 h-8 text-rose-400 mb-4" />
                 <h3 className="font-serif italic text-xl mb-2 text-[#F8FAFC]">{s.quizTitle}</h3>
                 <p className="text-xs text-indigo-300 uppercase tracking-widest">{new Date(s.updatedAt || Date.now()).toLocaleDateString()}</p>
                 <button onClick={() => window.location.hash = `#session/${s.id}`} className="mt-6 uppercase text-xs tracking-widest text-indigo-200 hover:text-white transition-colors bg-indigo-500/20 px-6 py-2 rounded-full border border-indigo-500/30">
                    View
                 </button>
             </div>
           ))
         )}
      </div>
    </div>
  );
}
