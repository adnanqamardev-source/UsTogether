"use client";

import { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, CheckCircle2 } from 'lucide-react';
import { handleFirestoreError, OperationType } from '@/lib/firestore-errors';
import { useFirestoreDocument, batchWrite } from '@/lib/firebase';
import { checkAndAwardAchievements } from '@/lib/achievements';
import type { Session, Quiz } from '../global.d';
import { doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function ActiveSession({ coupleId, sessionId }: { coupleId: string; sessionId: string }) {
  const { user } = useAuth();
  const [textAnswer, setTextAnswer] = useState('');
  const [isOffline, setIsOffline] = useState(false);

  const { data: session, loading: sessionLoading } = useFirestoreDocument<Session>([`couples/${coupleId}/sessions/${sessionId}`]);
  const quizId = session?.state?.quizId;
  const { data: quiz, loading: quizLoading } = useFirestoreDocument<Quiz>(quizId ? ['quizzes', quizId] : []);

  useEffect(() => {
    if (typeof navigator !== 'undefined') {
      setIsOffline(!navigator.onLine);
      const goOnline = () => setIsOffline(false);
      const goOffline = () => setIsOffline(true);
      window.addEventListener('online', goOnline);
      window.addEventListener('offline', goOffline);
      return () => {
        window.removeEventListener('online', goOnline);
        window.removeEventListener('offline', goOffline);
      };
    }
  }, []);

  if (sessionLoading || quizLoading || !session || !quiz || !user) {
    return <div className="text-gray-500 animate-pulse">Loading session...</div>;
  }

  const sessionData = session as Session;
  const quizData = quiz as Quiz;
  const userData = user as { uid: string };

  const currentQIndex = sessionData.state.currentQuestion || 0;
  useEffect(() => {
    setTextAnswer('');
  }, [currentQIndex]);

  const question = quizData.questions[currentQIndex];
  const myAnswer = sessionData.state.answers?.[currentQIndex]?.[userData.uid];
  const partnerId = [sessionData.coupleId.split('_')].flat().find((id) => id !== userData.uid) || 'partner';
  const partnerAnswer = sessionData.state.answers?.[currentQIndex]?.[partnerId];

  const bothAnswered = myAnswer !== undefined && partnerAnswer !== undefined;

  const sessionRef = doc(db, 'couples', coupleId, 'sessions', sessionId);

  const handleAnswer = async (answerVal: any) => {
    if (myAnswer !== undefined) return;
    try {
      const newState = { ...sessionData.state };
      if (!newState.answers) newState.answers = {};
      if (!newState.answers[currentQIndex]) newState.answers[currentQIndex] = {};
      newState.answers[currentQIndex][userData.uid] = answerVal;
      await batchWrite([
        { type: 'update', ref: sessionRef, data: { state: newState, updatedAt: Date.now() } },
      ]);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `couples/${coupleId}/sessions/${sessionId}`);
    }
  };

  const nextQuestion = async () => {
    try {
      if (currentQIndex + 1 >= quizData.questions.length) {
        await batchWrite([
          { type: 'update', ref: sessionRef, data: { status: 'finished', updatedAt: Date.now() } },
        ]);
        if (user && partnerId) {
          await checkAndAwardAchievements(userData.uid, { sessionsFinished: 1 });
          await checkAndAwardAchievements(partnerId, { sessionsFinished: 1 });
        }
      } else {
        await batchWrite([
          { type: 'update', ref: sessionRef, data: { 'state.currentQuestion': currentQIndex + 1, updatedAt: Date.now() } },
        ]);
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `couples/${coupleId}/sessions/${sessionId}`);
    }
  };

  const endSessionEarly = async () => {
    if (!window.confirm('Are you sure you want to end this quiz early?')) return;
    try {
      await batchWrite([
        { type: 'update', ref: sessionRef, data: { status: 'finished', updatedAt: Date.now() } },
      ]);
      if (user && partnerId) {
        await checkAndAwardAchievements(userData.uid, { sessionsFinished: 1 });
        await checkAndAwardAchievements(partnerId, { sessionsFinished: 1 });
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `couples/${coupleId}/sessions/${sessionId}`);
    }
  };

  if (sessionData.status === 'finished') {
    const allAnswers = sessionData.state.answers || {};

    return (
      <div className="flex flex-col items-center justify-center text-center mt-10 p-4 md:p-8 w-full max-w-4xl mx-auto">
        {isOffline && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-amber-500/90 text-white text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full shadow-lg backdrop-blur-sm">
            You're offline — changes will sync when reconnected
          </div>
        )}
        <div className="w-20 h-20 bg-rose-500/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(244,63,94,0.3)]">
          <Heart className="w-10 h-10 text-rose-500 mx-auto" />
        </div>
        <h2 className="text-3xl md:text-5xl font-serif italic mb-2 text-[#F8FAFC]">Quiz Finished!</h2>
        <p className="text-indigo-200/80 mb-8 max-w-md">You've completed "{quizData.title}". Let's see your shared answers.</p>

        <div className="w-full space-y-6 mb-10 text-left">
          {quizData.questions.map((q, i) => {
            const mAns = allAnswers[i]?.[userData.uid];
            const pAns = allAnswers[i]?.[partnerId];

            const resolveAns = (a: any) => {
              if (a === undefined) return <span className="text-white/30 italic">Not answered</span>;
              if (typeof a === 'number') return q.options?.[a] || String(a);
              return String(a);
            };

            return (
              <div key={i} className="bg-white/5 border border-white/10 p-6 rounded-2xl w-full">
                <p className="font-serif italic text-xl text-white mb-4">{i + 1}. {q.q}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-indigo-500/10 p-4 rounded-xl border border-indigo-500/20">
                    <p className="text-[10px] uppercase tracking-widest text-indigo-300 font-bold mb-1">You</p>
                    <p className="text-[#F8FAFC] flex content-start">{resolveAns(mAns)}</p>
                  </div>
                  <div className="bg-rose-500/10 p-4 rounded-xl border border-rose-500/20">
                    <p className="text-[10px] uppercase tracking-widest text-rose-300 font-bold mb-1">Partner</p>
                    <p className="text-[#F8FAFC] flex content-start">{resolveAns(pAns)}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button onClick={() => window.location.hash = ''} className="py-4 px-8 rounded-3xl bg-rose-500 text-white font-bold text-lg hover:bg-rose-600 transition-all shadow-xl shadow-rose-500/20 ring-2 ring-rose-500/50 ring-offset-4 ring-offset-[#0F0A1F]">
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 md:py-12 flex flex-col h-full justify-center">
      {isOffline && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-amber-500/90 text-white text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full shadow-lg backdrop-blur-sm">
          You're offline — changes will sync when reconnected
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-4">
        <h2 className="font-bold text-indigo-300 uppercase tracking-[0.2em] text-xs flex items-center space-x-4">
          <span>{quizData.title}</span>
          <button onClick={endSessionEarly} className="text-white/30 hover:text-rose-400 font-normal underline underline-offset-4">End Session</button>
        </h2>
        <span className="text-xs font-bold px-3 py-1 bg-white/10 text-white rounded-full border border-white/5 uppercase tracking-widest whitespace-nowrap">
          Question {currentQIndex + 1} of {quizData.questions.length}
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

          {question.type === 'text' || !question.options ? (
            <div className="w-full flex justify-center">
              <div className="w-full max-w-2xl space-y-6">
                {myAnswer === undefined ? (
                  <div className="flex flex-col gap-4">
                    <textarea
                      value={textAnswer}
                      onChange={(e) => setTextAnswer(e.target.value)}
                      placeholder="Type your thoughts..."
                      className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 text-lg text-white placeholder-indigo-200/50 focus:outline-none focus:border-rose-500/50 transition-colors resize-none min-h-[150px]"
                    />
                    <div className="flex justify-end">
                      <button
                        onClick={() => { if (textAnswer.trim()) handleAnswer(textAnswer.trim()) }}
                        disabled={!textAnswer.trim()}
                        className="bg-indigo-500 hover:bg-indigo-400 text-white font-bold uppercase tracking-widest text-sm py-4 px-8 rounded-full transition-all disabled:opacity-50 disabled:hover:bg-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.3)]"
                      >
                        Submit
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-6 bg-indigo-500/20 border border-indigo-500/30 rounded-3xl shadow-inner shadow-indigo-500/10">
                      <p className="text-xs text-indigo-300 uppercase tracking-widest font-bold mb-3">Your Answer</p>
                      <p className="text-[#F8FAFC] text-xl font-serif italic">{myAnswer}</p>
                    </div>
                    {partnerAnswer !== undefined && bothAnswered && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ type: "spring", damping: 20, stiffness: 200 }}
                        className="p-6 bg-rose-500/20 border border-rose-500/30 rounded-3xl shadow-inner shadow-rose-500/10 relative overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 p-4 text-2xl">✨</div>
                        <p className="text-xs text-rose-300 uppercase tracking-widest font-bold mb-3">Partner's Answer</p>
                        <p className="text-[#F8FAFC] text-xl font-serif italic">{partnerAnswer}</p>
                      </motion.div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
              {question.options?.map((opt, i) => {
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
                    <span className={iSelected ? 'tracking-normal' : ''}><span className="font-bold opacity-50 mr-2">{letter}.</span> {opt}</span>
                    <div className="flex items-center gap-2">
                      {pSelected && bothAnswered && <span className="text-[10px] font-bold text-indigo-900 bg-indigo-300 px-2 py-1 rounded-full uppercase tracking-widest shadow-lg">Partner</span>}
                      {iSelected ? <span>✓</span> : <span className="opacity-0 group-hover:opacity-100 transition-opacity">✨</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          <div className="mt-16 text-center h-16 flex items-center justify-center">
            {myAnswer === undefined ? (
              <div className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-bounce" style={{ animationDelay: '100ms' }}></div>
                <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></div>
                <p className="text-rose-400/80 text-sm italic ml-2">Waiting for your answer</p>
              </div>
            ) : partnerAnswer === undefined ? (
              <div className="flex flex-col items-center space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '100ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></div>
                  <p className="text-indigo-400 text-sm font-medium uppercase tracking-widest ml-2">Waiting for partner</p>
                </div>
                <button onClick={nextQuestion} className="text-[10px] text-white/20 hover:text-white/60 uppercase tracking-widest transition-colors">Force Next (Dev)</button>
              </div>
            ) : (
              <motion.button
                onClick={nextQuestion}
                whileTap={{ scale: 0.97 }}
                className="bg-gradient-to-r from-white to-indigo-50 text-[#0F0A1F] font-bold uppercase tracking-[0.2em] text-sm rounded-full px-10 py-4 w-full max-w-xs hover:scale-105 hover:shadow-[0_0_35px_rgba(99,102,241,0.4)] transition-all shadow-[0_0_25px_rgba(255,255,255,0.15)]"
              >
                {currentQIndex + 1 >= quizData.questions.length ? 'Finish Quiz' : 'Next Question →'}
              </motion.button>
            )}
          </div>

          <div className="mt-8 pt-8 border-t border-white/10 flex items-center justify-center space-x-2">
            {quizData.questions.map((_: any, idx: number) => (
              <motion.div
                key={idx}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className={`h-1.5 rounded-full transition-all origin-left ${idx < currentQIndex ? 'bg-indigo-500 w-8 shadow-[0_0_6px_rgba(99,102,241,0.4)]' : idx === currentQIndex ? 'bg-rose-500 w-12 shadow-[0_0_12px_rgba(244,63,94,0.7)]' : 'bg-white/20 w-8'}`}
              ></motion.div>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}