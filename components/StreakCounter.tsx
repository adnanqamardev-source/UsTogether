"use client";

import { Flame } from "lucide-react";

type StreakCounterProps = {
  streak?: number;
  label?: string;
};

export default function StreakCounter({ streak = 0, label = "Day Streak" }: StreakCounterProps) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur-md">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-500/20 text-rose-400">
          <Flame className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest text-indigo-300">{label}</p>
          <p className="text-2xl font-bold text-[#F8FAFC]">{streak} 🔥</p>
        </div>
      </div>
    </div>
  );
}