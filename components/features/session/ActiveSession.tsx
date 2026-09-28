"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from '@/components/providers';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, CheckCircle2 } from 'lucide-react';
import { handleFirestoreError, OperationType } from '@/lib/firestore-errors';
import { useFirestoreDocument, batchWrite } from '@/lib/firebase/client';
import { checkAndAwardAchievements } from '@/lib/achievements';
import type { Session, Quiz, Couple } from '@/types';
import { doc, runTransaction } from '@/lib/firestore';
import { db } from '@/lib/firebase/client';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/input";

export default function ActiveSession({ coupleId, sessionId, couple }: { coupleId: string; sessionId: string; couple?: Couple | null }) {
  const { user } = useAuth();
  const [textAnswer, setTextAnswer] = useState('');

  const { data: session, loading: sessionLoading } = useFirestoreDocument<Session>([`couples/${coupleId}/sessions/${sessionId}`]);
  const quizId = session?.state?.quizId;
  const { data: quiz, loading: quizLoading } = useFirestoreDocument<Quiz>(quizId ? ['quizzes', quizId] : []);
  const submittingRef = useRef(false);

  const currentQIndex = session?.state?.currentQuestion || 0;
  useEffect(() => {
    setTextAnswer('');
  }, [currentQIndex]);

  if (sessionLoading || quizLoading || !session || !quiz || !user) {
    return <div className="text-gray-500 animate-pulse">Loading session...</div>;
  }

  const question = quiz.questions[currentQIndex];
  const isFinished = currentQIndex >= quiz.questions.length;

  const myAnswer = session.state.answers?.[currentQIndex]?.[user.uid];
  const partnerId =
    couple && user
      ? couple.user1Id === user.uid
        ? couple.user2Id
        : couple.user1Id
      : '';
  const partnerAnswer = partnerId ? session.state.answers?.[currentQIndex]?.[partnerId] : undefined;

  const bothAnswered = myAnswer !== undefined && partnerAnswer !== undefined;

  const sessionRef = doc(db, 'couples', coupleId, 'sessions', sessionId);

  const handleAnswer = async (answerVal: any) => {
    if (myAnswer !== undefined) return;
    if (submittingRef.current) return;
    submittingRef.current = true;
    try {
      await runTransaction(db, async (transaction) => {
        const sessionDocRef = doc(db, 'couples', coupleId, 'sessions', sessionId);
        const serverDoc = await transaction.get(sessionDocRef);
        if (!serverDoc.exists()) return;
        const serverState = serverDoc.data()?.state || {};
        const qIndex = serverState.currentQuestion ?? 0;
        const mergedAnswers = { ...(serverState.answers || {}) };
        mergedAnswers[qIndex] = { ...(mergedAnswers[qIndex] || {}) };
        mergedAnswers[qIndex][user.uid] = answerVal;

        transaction.update(sessionDocRef, {
          state: {
            ...serverState,
            answers: mergedAnswers,
          },
          updatedAt: Date.now(),
        });
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `couples/${coupleId}/sessions/${sessionId}`);
    } finally {
      setTimeout(() => { submittingRef.current = false; }, 800);
    }
  };

  const nextQuestion = async () => {
    try {
      if (currentQIndex + 1 >= quiz.questions.length) {
        await batchWrite([
          { type: 'update', ref: sessionRef, data: { status: 'finished', updatedAt: Date.now() } },
        ]);
        if (user) {
          await checkAndAwardAchievements(user.uid, { sessionsFinished: 1 });
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
      if (user) {
        await checkAndAwardAchievements(user.uid, { sessionsFinished: 1 });
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `couples/${coupleId}/sessions/${sessionId}`);
    }
  };

  if (session.status === 'finished') {
    const allAnswers = session.state.answers || {};

    return (
      <div className="flex flex-col items-center justify-center text-center mt-10 p-4 md:p-8 w-full max-w-4xl mx-auto">
        <div className="w-20 h-20 bg-[#bcabae]/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(188,171,174,)]">
          <Heart className="w-10 h-10 text-[#bcabae] mx-auto" />
        </div>
        <h2 className="text-3xl md:text-5xl font-serif italic mb-2 text-white">Quiz Finished!</h2>
        <p className="text-[#bcabae]/80 mb-8 max-w-md">You've completed "{quiz.title}". Let's see your shared answers.</p>

        <div className="w-full space-y-6 mb-10 text-left">
          {quiz.questions.map((q, i) => {
            const mAns = allAnswers[i]?.[user.uid];
            const pAns = allAnswers[i]?.[partnerId];

            const resolveAns = (a: any) => {
              if (a === undefined) return <span className="text-white/30 italic">Not answered</span>;
              if (typeof a === 'number') return q.options?.[a] || String(a);
              return String(a);
            };

            return (
              <Card key={i} variant="standard" padding="md">
                <p className="font-serif italic text-xl text-white mb-4">{i + 1}. {q.q}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-[#2d2e2e]/10 p-4 rounded-xl border border-[#2d2e2e]/20">
                    <p className="text-[10px] uppercase tracking-widest text-[#bcabae] font-bold mb-1">You</p>
                    <p className="text-white flex content-start">{resolveAns(mAns)}</p>
                  </div>
                  <div className="bg-[#bcabae]/10 p-4 rounded-xl border border-[#bcabae]/20">
                    <p className="text-[10px] uppercase tracking-widest text-[#bcabae] font-bold mb-1">Partner</p>
                    <p className="text-white flex content-start">{resolveAns(pAns)}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <Button variant="primary" size="lg" onClick={() => window.location.hash = ''}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 md:py-12 flex flex-col h-full justify-center">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-4">
        <h2 className="font-bold text-[#bcabae] uppercase tracking-[0.2em] text-xs flex items-center space-x-4">
          <span>{quiz.title}</span>
          <button onClick={endSessionEarly} className="text-white/30 hover:text-[#bcabae] font-normal underline underline-offset-4">End Session</button>
        </h2>
        <Badge variant="secondary" size="sm">
          Question {currentQIndex + 1} of {quiz.questions.length}
        </Badge>
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
                    <Textarea
                      value={textAnswer}
                      onChange={(e) => setTextAnswer(e.target.value)}
                      placeholder="Type your thoughts..."
                      className="min-h-[150px] text-lg"
                    />
                    <div className="flex justify-end">
                      <Button
                        variant="primary"
                        size="md"
                        onClick={() => { if (textAnswer.trim()) handleAnswer(textAnswer.trim()) }}
                        disabled={!textAnswer.trim()}
                      >
                        Submit
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-6 bg-[#2d2e2e]/20 border border-[#2d2e2e]/30 rounded-3xl shadow-inner shadow-[#2d2e2e]/10">
                      <p className="text-xs text-[#bcabae] uppercase tracking-widest font-bold mb-3">Your Answer</p>
                      <p className="text-white text-xl font-serif italic">{myAnswer}</p>
                    </div>
                    {partnerAnswer !== undefined && bothAnswered && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ type: "spring", damping: 20, stiffness: 200 }}
                        className="p-6 bg-[#bcabae]/20 border border-[#bcabae]/30 rounded-3xl shadow-inner shadow-[#bcabae]/10 relative overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 p-4 text-2xl">✨</div>
                        <p className="text-xs text-[#bcabae] uppercase tracking-widest font-bold mb-3">Partner's Answer</p>
                        <p className="text-white text-xl font-serif italic">{partnerAnswer}</p>
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
                      ${iSelected ? 'bg-[#bcabae] text-white font-bold ring-2 ring-[#bcabae]/50 ring-offset-2 ring-offset-onyx shadow-[0_0_20px_rgba(188,171,174,)]'
                      : 'bg-white/5 border border-white/10 hover:bg-[#bcabae]/20 hover:border-[#bcabae]/50 text-white'}
                      ${myAnswer !== undefined && !iSelected ? 'opacity-30' : ''}
                    `}
                  >
                    <span className={iSelected ? 'tracking-normal' : ''}><span className="font-bold opacity-50 mr-2">{letter}.</span> {opt}</span>
                    <div className="flex items-center gap-2">
                      {pSelected && bothAnswered && <span className="text-[10px] font-bold text-[#0f0f0f] bg-[#bcabae] px-2 py-1 rounded-full uppercase tracking-widest shadow-lg">Partner</span>}
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
                <div className="w-1.5 h-1.5 bg-[#bcabae] rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-[#bcabae] rounded-full animate-bounce" style={{ animationDelay: '100ms' }}></div>
                <div className="w-1.5 h-1.5 bg-[#bcabae] rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></div>
                <p className="text-[#bcabae]/80 text-sm italic ml-2">Waiting for your answer</p>
              </div>
            ) : partnerAnswer === undefined ? (
              <div className="flex flex-col items-center space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-[#2d2e2e] rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-[#2d2e2e] rounded-full animate-bounce" style={{ animationDelay: '100ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-[#2d2e2e] rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></div>
                  <p className="text-[#bcabae] text-sm font-medium uppercase tracking-widest ml-2">Waiting for partner</p>
                </div>
                {process.env.NODE_ENV !== 'production' && (
                  <button onClick={nextQuestion} className="text-[10px] text-white/20 hover:text-white/60 uppercase tracking-widest transition-colors">Force Next (Dev)</button>
                )}
              </div>
            ) : (
              <motion.div
                whileTap={{ scale: 0.97 }}
              >
                <Button
                  variant="primary"
                  size="lg"
                  onClick={nextQuestion}
                  className="w-full max-w-xs"
                >
                  {currentQIndex + 1 >= quiz.questions.length ? 'Finish Quiz' : 'Next Question →'}
                </Button>
              </motion.div>
            )}
          </div>

          <div className="mt-8 pt-8 border-t border-white/10 flex items-center justify-center space-x-2">
            {quiz.questions.map((_: any, idx: number) => (
              <motion.div
                key={idx}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className={`h-1.5 rounded-full transition-all origin-left ${idx < currentQIndex ? 'bg-[#2d2e2e] w-8 shadow-[0_0_6px_rgba(188,171,174,0.4)]' : idx === currentQIndex ? 'bg-[#bcabae] w-12 shadow-[0_0_12px_rgba(188,171,174,0.6)]' : 'bg-white/20 w-8'}`}
              ></motion.div>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
