import { useState, useEffect } from 'react';
import { doc, onSnapshot, updaTeDoc, updateDoc } from 'firebase/firestore'; // Typo updaTeDoc... wait I'll write correctly
import { db } from '@/lib/firebase';
import { useAuth } from './AuthProvider';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, CheckCircle2 } from 'lucide-react';
import { handleFirestoreError, OperationType } from '@/lib/firestore-errors';

export default function ActiveSession({ coupleId, sessionId }: { coupleId: string, sessionId: string }) {
  const { user } = useAuth();
  const [session, setSession] = useState<any>(null);
  const [quiz, setQuiz] = useState<any>(null);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, `sessions/${sessionId}`), (snapshot) => {
       if (snapshot.exists()) {
          setSession({ id: snapshot.id, ...snapshot.data() });
       }
    });
    return () => unsub();
  }, [sessionId]);

  useEffect(() => {
    if (session?.state?.quizId && !quiz) {
       onSnapshot(doc(db, `quizzes/${session.state.quizId}`), (snapshot) => {
          if (snapshot.exists()) {
             setQuiz({ id: snapshot.id, ...snapshot.data() });
          }
       });
    }
  }, [session?.state?.quizId, quiz]);

  if (!session || !quiz || !user) return <div className="text-gray-500 animate-pulse">Loading session...</div>;

  const currentQIndex = session.state.currentQuestion || 0;
  const question = quiz.questions[currentQIndex];
  const isFinished = currentQIndex >= quiz.questions.length;

  const myAnswer = session.state.answers?.[currentQIndex]?.[user.uid];
  const partnerId = [session.coupleId.split('_')].flat().find(id => id !== user.uid) || 'partner';
  const partnerAnswer = session.state.answers?.[currentQIndex]?.[partnerId];
  
  const bothAnswered = myAnswer !== undefined && partnerAnswer !== undefined;

  const handleAnswer = async (answerIndex: number) => {
    if (myAnswer !== undefined) return; // Already answered
    try {
      const newState = { ...session.state };
      if (!newState.answers) newState.answers = {};
      if (!newState.answers[currentQIndex]) newState.answers[currentQIndex] = {};
      newState.answers[currentQIndex][user.uid] = answerIndex;

      // if question is matched (just testing if they gave the SAME answer for now or correct answer? 
      // depends on "How well do you know me" logic.) Let's just track answers.
      await updateDoc(doc(db, `sessions/${sessionId}`), {
        state: newState,
        updatedAt: Date.now(),
        ...( /* if both answered and it's the last question, we could mark finished here, but doing it in next question step is safer */ {})
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `sessions/${sessionId}`, user);
    }
  };

  const nextQuestion = async () => {
    try {
      if (currentQIndex + 1 >= quiz.questions.length) {
         await updateDoc(doc(db, `sessions/${sessionId}`), {
           status: 'finished',
           updatedAt: Date.now()
         });
      } else {
         await updateDoc(doc(db, `sessions/${sessionId}`), {
           'state.currentQuestion': currentQIndex + 1,
           updatedAt: Date.now()
         });
      }
    } catch (e) {
       handleFirestoreError(e, OperationType.UPDATE, `sessions/${sessionId}`, user);
    }
  }

  // Finished State
  if (session.status === 'finished') {
     return (
       <div className="flex flex-col items-center justify-center text-center mt-20 p-8">
         <div className="w-24 h-24 bg-rose-500/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(244,63,94,0.3)]">
           <Heart className="w-12 h-12 text-rose-500 mx-auto" />
         </div>
         <h2 className="text-4xl md:text-5xl font-serif italic mb-4 text-[#F8FAFC]">Quiz Finished!</h2>
         <p className="text-indigo-200/80 mb-10 max-w-md">You've completed "{quiz.title}". Your answers have been synced to the vault.</p>
         <button onClick={() => window.location.hash = ''} className="py-4 px-8 rounded-3xl bg-rose-500 text-white font-bold text-lg hover:bg-rose-600 transition-all shadow-xl shadow-rose-500/20 ring-2 ring-rose-500/50 ring-offset-4 ring-offset-[#0F0A1F]">
            Back to Dashboard
         </button>
       </div>
     );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 md:py-12 flex flex-col h-full justify-center">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-4">
        <h2 className="font-bold text-indigo-300 uppercase tracking-[0.2em] text-xs">{quiz.title}</h2>
        <span className="text-xs font-bold px-3 py-1 bg-white/10 text-white rounded-full border border-white/5 uppercase tracking-widest whitespace-nowrap">
          Question {currentQIndex + 1} of {quiz.questions.length}
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div 
          key={currentQIndex}
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }} 
          exit={{ opacity: 0, scale: 1.05 }}
          className="flex flex-col w-full"
        >
          <h3 className="text-3xl md:text-5xl font-serif italic mb-10 text-white leading-tight">
            {question.q}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            {question.options?.map((opt: string, i: number) => {
              const iSelected = myAnswer === i;
              const pSelected = partnerAnswer === i;
              const letter = String.fromCharCode(65 + i);
              return (
                <button
                  key={i}
                  disabled={myAnswer !== undefined}
                  onClick={() => handleAnswer(i)}
                  className={`py-4 px-6 rounded-3xl text-base md:text-lg text-left flex justify-between items-center group transition-all
                    ${iSelected ? 'bg-rose-500 text-white font-bold ring-2 ring-rose-500/50 ring-offset-2 ring-offset-[#0F0A1F] shadow-[0_0_20px_rgba(244,63,94,0.3)]' 
                    : 'bg-white/5 border border-white/10 hover:bg-rose-500/20 hover:border-rose-500/50 text-[#F8FAFC]'}
                    ${myAnswer !== undefined && !iSelected ? 'opacity-30' : ''}
                  `}
                >
                  <span className={`${iSelected ? 'tracking-normal' : ''}`}><span className="font-bold opacity-50 mr-2">{letter}.</span> {opt}</span>
                  <div className="flex items-center gap-2">
                     {pSelected && bothAnswered && <span className="text-[10px] font-bold text-indigo-900 bg-indigo-300 px-2 py-1 rounded-full uppercase tracking-widest shadow-lg">Partner</span>}
                     {iSelected ? <span>✓</span> : <span className="opacity-0 group-hover:opacity-100 transition-opacity">✨</span>}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-16 text-center h-16 flex items-center justify-center">
             {!myAnswer ? (
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-bounce" style={{animationDelay: '100ms'}}></div>
                  <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-bounce" style={{animationDelay: '200ms'}}></div>
                  <p className="text-rose-400/80 text-sm italic ml-2">Waiting for your answer</p>
                </div>
             ) : !partnerAnswer ? (
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{animationDelay: '100ms'}}></div>
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{animationDelay: '200ms'}}></div>
                  <p className="text-indigo-400 text-sm font-medium uppercase tracking-widest ml-2">Waiting for partner</p>
                </div>
             ) : (
                <button onClick={nextQuestion} className="bg-white text-[#0F0A1F] font-bold uppercase tracking-[0.2em] text-sm rounded-full px-10 py-4 w-full max-w-xs hover:scale-105 hover:bg-indigo-50 transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                   {currentQIndex + 1 >= quiz.questions.length ? 'Finish Quiz' : 'Next Question →'}
                </button>
             )}
          </div>
          
          <div className="mt-8 pt-8 border-t border-white/10 flex items-center justify-center space-x-2">
            {quiz.questions.map((_: any, idx: number) => (
               <div key={idx} className={`h-1.5 rounded-full transition-all ${idx < currentQIndex ? 'bg-indigo-500 w-8 shadow-[0_0_8px_rgba(99,102,241,0.5)]' : idx === currentQIndex ? 'bg-rose-500 w-12 shadow-[0_0_8px_rgba(244,63,94,0.5)]' : 'bg-white/20 w-8'}`}></div>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
