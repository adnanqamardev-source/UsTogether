"use client";

import { Trophy } from "lucide-react";

type Achievement = {
  id: string;
  title: string;
  description: string;
  unlockedAt?: number;
};

type AchievementsPanelProps = {
  achievements?: Achievement[];
};

export default function AchievementsPanel({ achievements = [] }: AchievementsPanelProps) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur-md">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-300">
          <Trophy className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest text-indigo-300">Achievements</p>
          <p className="text-2xl font-bold text-[#F8FAFC]">{achievements.length}</p>
        </div>
      </div>

      {achievements.length === 0 ? (
        <p className="text-sm text-indigo-200/60">No achievements yet. Keep playing to unlock!</p>
      ) : (
        <ul className="space-y-3">
          {achievements.slice(0, 3).map((a) => (
            <li key={a.id} className="flex items-start gap-3 rounded-2xl border border-white/5 bg-white/5 p-3">
              <span className="mt-0.5 text-lg">🏆</span>
              <div>
                <p className="text-sm font-semibold text-[#F8FAFC]">{a.title}</p>
                <p className="text-xs text-indigo-200/60">{a.description}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}