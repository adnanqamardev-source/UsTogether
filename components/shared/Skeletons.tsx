'use client';

import { motion } from 'motion/react';

function QuizCardSkeleton() {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 animate-pulse">
      <div className="h-6 bg-white/10 rounded w-3/4 mb-4" />
      <div className="h-4 bg-white/10 rounded w-1/2 mb-6" />
      <div className="space-y-3">
        <div className="h-12 bg-white/10 rounded-xl" />
        <div className="h-12 bg-white/10 rounded-xl" />
        <div className="h-12 bg-white/10 rounded-xl" />
        <div className="h-12 bg-white/10 rounded-xl" />
      </div>
      <div className="mt-6 h-10 bg-white/5 rounded-xl border border-dashed border-white/10 flex items-center justify-center text-white/20">
        <span className="text-xs uppercase tracking-widest">☕ Chai Time</span>
      </div>
    </div>
  );
}

export function ChatPanelSkeleton() {
  return (
    <div className="space-y-4 p-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.1 }}
          className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`rounded-2xl px-4 py-2.5 ${
              i % 2 === 0 ? 'bg-white/10 w-3/4' : 'bg-white/5 w-1/2'
            }`}
          >
            <div className="h-3 bg-white/10 rounded w-full mb-2" />
            <div className={`h-3 bg-white/5 rounded ${i % 2 === 0 ? 'w-1/3' : 'w-1/4'}`} />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-10 bg-white/10 rounded w-1/3" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 h-32" />
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 h-32" />
      </div>
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 h-64" />
    </div>
  );
}

export function AchievementsPanelSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
          <div className="w-12 h-12 bg-white/10 rounded-full mx-auto mb-3" />
          <div className="h-4 bg-white/10 rounded w-3/4 mx-auto mb-2" />
          <div className="h-3 bg-white/5 rounded w-1/2 mx-auto" />
        </div>
      ))}
    </div>
  );
}