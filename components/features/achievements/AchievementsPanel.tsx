"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Trophy, ChevronDown, ChevronUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? achievements : achievements.slice(0, 5);

  return (
    <Card
      variant="standard"
      padding="md"
      className="overflow-hidden"
    >
      {/* trophy glow */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#2d2e2e]/20 blur-[60px] rounded-full pointer-events-none" />

      <div className="flex items-center gap-3 relative z-10">
        <div className="relative">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2d2e2e]/20 text-[#bcabae]">
            <Trophy className="h-5 w-5" />
          </div>
          {achievements.length > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 15, stiffness: 200, delay: 0.3 }}
              className="absolute -top-2 -right-2 text-base"
            >
              🏆
            </motion.span>
          )}
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-[#bcabae]">Achievements</p>
          <p className="text-3xl font-bold text-white">{achievements.length}</p>
        </div>
      </div>

      {achievements.length === 0 ? (
        <p className="text-sm text-[#bcabae]/70 mt-4 relative z-10">No achievements yet. Keep playing to unlock!</p>
      ) : (
        <>
          <ul className="mt-5 space-y-3 relative z-10">
            <AnimatePresence>
              {visible.map((a) => (
                <motion.li
                  key={a.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-start gap-3 rounded-2xl border border-white/5 bg-white/5 p-3 hover:border-[#2d2e2e]/30 transition-colors"
                >
                  <span className="mt-0.5 text-lg">🏆</span>
                  <div>
                    <p className="text-sm font-semibold text-white">{a.title}</p>
                    <p className="text-xs text-[#bcabae]/70">{a.description}</p>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>

          {achievements.length > 5 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAll(!showAll)}
              className="mt-4 relative z-10"
            >
              {showAll ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              {showAll ? 'Show Less' : 'View All'}
            </Button>
          )}
        </>
      )}
    </Card>
  );
}
