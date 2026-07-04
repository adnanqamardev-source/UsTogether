import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useAuth } from './AuthProvider';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Images, Calendar, Sparkles, Loader } from 'lucide-react';
import { handleFirestoreError, OperationType } from '@/lib/firestore-errors';
import Markdown from 'react-markdown';

function getQuizTitle(s: any): string {
  return s.quizTitle || s.state?.quizTitle || 'Unknown Quiz';
}

function formatMemoryDate(ts: number | undefined): string {
  if (!ts) return 'Just now';
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(ts));
}

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
        const sessions = sn.docs.map(d => ({ id: d.id, ...d.data() }));
        
        // Filter out sessions with empty quizzes to keep memories meaningful
        const validSessions = sessions.filter((s: any) => {
          const quizId = s.state?.quizId;
          if (!quizId) return false;
          // We can't reliably check quiz questions here without extra fetch,
          // but we can filter out sessions with no answers as a proxy
          const answers = s.state?.answers || {};
          const hasAnswers = Object.keys(answers).length > 0;
          return hasAnswers;
        });
        
        setFinishedSessions(validSessions);
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
          history: finishedSessions.map(s => ({ title: getQuizTitle(s), answers: s.state?.answers }))
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

            <div className="columns-2 md:columns-3 gap-6 space-y-6">
          {finishedSessions.length === 0 ? (
        <div className="col-span-full text-center py-20 bg-white/5 border border-white/10 rounded-3xl">
           <div className="mx-auto mb-4 flex items-center justify-center">
             <div className="w-16 h-16 rounded-full border border-dashed border-white/20 flex items-center justify-center text-2xl">☕</div>
           </div>
           <p className="text-indigo-200/50">No chai-sipped quizzes yet — start one and make some memories.</p>
        </div>
          ) : (
            finishedSessions.map(s => (
              <motion.div
                key={s.id}
                whileHover={{ scale: 1.03, y: -4 }}
                className="group relative bg-white/5 p-6 rounded-[2rem] border border-white/10 shadow-lg flex flex-col items-center overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 via-indigo-500/0 to-rose-500/0 group-hover:from-indigo-500/10 group-hover:to-rose-500/10 transition-all duration-500 pointer-events-none" />
                <Calendar className="w-8 h-8 text-rose-400 mb-4 relative z-10" />
                <h3 className="font-serif italic text-xl mb-2 text-[#F8FAFC] relative z-10">{getQuizTitle(s)}</h3>
                <p className="text-xs text-indigo-300 uppercase tracking-widest relative z-10">{formatMemoryDate(s.updatedAt)}</p>
                <button onClick={() => window.location.hash = `#session/${s.id}`} className="mt-6 uppercase text-xs tracking-widest text-indigo-200 hover:text-white transition-colors bg-indigo-500/20 px-6 py-2 rounded-full border border-indigo-500/30 relative z-10 group-hover:bg-indigo-500/40 group-hover:border-indigo-400/50">
                   View
                </button>
              </motion.div>
            ))
          )}
        </div>
    </div>
  );
}
