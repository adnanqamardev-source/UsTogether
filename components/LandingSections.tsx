"use client";

import { motion } from "motion/react";

export default function LandingSections() {
  return (
    <div className="relative overflow-hidden">
      {/* Floating gradient orbs */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -top-24 left-1/4 h-72 w-72 rounded-full bg-rose-500/20 blur-[120px]" />
        <div className="absolute top-1/3 -right-20 h-80 w-80 rounded-full bg-indigo-500/20 blur-[120px]" />
        <div className="absolute -bottom-16 left-1/3 h-64 w-64 rounded-full bg-purple-500/15 blur-[100px]" />
      </div>

      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative z-10 max-w-3xl mx-auto text-center space-y-12"
      >
        <motion.h1
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-5xl md:text-7xl font-serif italic tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#F8FAFC] to-indigo-200 leading-tight text-balance"
        >
          How well do you know each other?
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.25 }}
          className="text-lg md:text-xl text-indigo-200/80 max-w-2xl mx-auto font-light"
        >
          Create personalized quizzes relevant to your journey together, compete on leaderboards, and share real-time memories with your partner.
        </motion.p>
      </motion.section>
    </div>
  );
}