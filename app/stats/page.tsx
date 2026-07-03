"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useFirestoreDocument, useFirestoreCollection } from '@/lib/firebase';
import { where } from 'firebase/firestore';
import { Trophy, Flame, Calendar, BarChart3, Share2 } from 'lucide-react';
import type { Couple, Session, Achievement } from '@/global.d';

export default function StatsPage() {
  const { user } = useAuth();
  const [coupleId, setCoupleId] = useState<string | null>(null);

  const { data: userProfile } = useFirestoreDocument<any>(user ? ['users', user.uid] : []);
  const { data: couple } = useFirestoreDocument<Couple>(userProfile?.pairedCoupleId ? ['couples', userProfile.pairedCoupleId] : []);

  useEffect(() => {
    if (userProfile?.pairedCoupleId) {
      setCoupleId(userProfile.pairedCoupleId);
    }
  }, [userProfile]);

  const finishedConstraints = coupleId
    ? [where('coupleId', '==', coupleId), where('status', '==', 'finished')]
    : undefined as any;

  const { data: finishedSessions } = useFirestoreCollection<Session>(
    coupleId ? ['sessions'] : [],
    finishedConstraints,
    (id, data) => ({ id, ...(data as Omit<Session, 'id'>) } as Session)
  );

  const { data: achievements } = useFirestoreCollection<Achievement>(
    user ? ['achievements', user.uid, 'items'] : [],
    [],
    (id, data) => ({ id, ...(data as Omit<Achievement, 'id'>) } as Achievement)
  );

  const totalPoints = couple?.totalScore || 0;
  const currentStreak = userProfile?.streak || 0;
  const totalSessions = finishedSessions?.length || 0;
  const totalAchievements = achievements?.length || 0;

  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  }).reverse();

  const activityMap = new Map<string, number>();
  finishedSessions?.forEach((s) => {
    if (s.updatedAt) {
      const date = new Date(s.updatedAt).toISOString().split('T')[0];
      activityMap.set(date, (activityMap.get(date) || 0) + 1);
    }
  });

  const handleShare = async () => {
    const text = `UsTogether: ${totalPoints} points, ${currentStreak} day streak, ${totalAchievements} achievements! 💕`;
    try {
      await navigator.clipboard.writeText(text);
      alert('Copied to clipboard!');
    } catch {
      console.error('Share failed');
    }
  };

  if (!coupleId) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-slate-400">Pair with your partner to view stats.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 md:py-12 w-full">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-4xl md:text-5xl font-serif italic text-white mb-2">Your Journey</h1>
          <p className="text-slate-400">Track your connection, growth, and milestones together.</p>
        </div>
        <button onClick={handleShare} className="p-3 bg-slate-800 hover:bg-slate-700 text-white rounded-full transition-colors" aria-label="Share stats">
          <Share2 className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
          <Trophy className="w-8 h-8 text-amber-400 mx-auto mb-2" />
          <div className="text-3xl font-bold text-white">{totalPoints}</div>
          <div className="text-xs text-slate-400 uppercase tracking-widest mt-1">Total Points</div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
          <Flame className="w-8 h-8 text-rose-400 mx-auto mb-2" />
          <div className="text-3xl font-bold text-white">{currentStreak}</div>
          <div className="text-xs text-slate-400 uppercase tracking-widest mt-1">Day Streak</div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
          <BarChart3 className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
          <div className="text-3xl font-bold text-white">{totalSessions}</div>
          <div className="text-xs text-slate-400 uppercase tracking-widest mt-1">Quizzes Done</div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
          <Calendar className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
          <div className="text-3xl font-bold text-white">{totalAchievements}</div>
          <div className="text-xs text-slate-400 uppercase tracking-widest mt-1">Achievements</div>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-12">
        <h2 className="text-xl font-semibold text-white mb-6">Last 30 Days Activity</h2>
        <div className="flex flex-wrap gap-2">
          {last30Days.map((date) => {
            const count = activityMap.get(date) || 0;
            const intensity = Math.min(count, 5);
            return (
              <div
                key={date}
                className="flex flex-col items-center"
                title={`${date}: ${count} session(s)`}
              >
                <div
                  className={`w-8 h-8 rounded-lg ${intensity === 0 ? 'bg-white/5' : `bg-indigo-500/${intensity * 20}`}`}
                  style={{ opacity: intensity === 0 ? 0.3 : 0.3 + intensity * 0.15 }}
                />
                <span className="text-[10px] text-slate-500 mt-1">{new Date(date).getDate()}</span>
              </div>
            );
          })}
        </div>
      </div>

      {achievements && achievements.length > 0 && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Recent Achievements</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {achievements.slice(0, 8).map((a) => (
              <div key={a.id} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                <div className="text-4xl mb-2">🏆</div>
                <div className="text-sm font-medium text-white">{a.title}</div>
                <div className="text-[10px] text-slate-500 mt-1">
                  {a.unlockedAt ? new Date(a.unlockedAt).toLocaleDateString() : ''}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}