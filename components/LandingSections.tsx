"use client";

import { motion } from "motion/react";
import { Users, Trophy, Flame } from "lucide-react";

export default function LandingSections() {
  return (
    <div className="relative overflow-hidden">
      {/* Floating gradient orbs */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -top-24 left-1/4 h-72 w-72 rounded-full bg-rose-500/20 blur-[120px] animate-float" />
        <div className="absolute top-1/3 -right-20 h-80 w-80 rounded-full bg-indigo-500/20 blur-[120px] animate-float-delayed" />
        <div className="absolute -bottom-16 left-1/3 h-64 w-64 rounded-full bg-purple-500/15 blur-[100px] animate-float" />
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

        {/* Animated Stats Counter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-wrap justify-center gap-6 mt-8"
        >
          {[
            { icon: Users, label: "Couples Playing", value: "12K+", color: "from-rose-500 to-pink-500" },
            { icon: Trophy, label: "Quizzes Completed", value: "85K+", color: "from-indigo-500 to-purple-500" },
            { icon: Flame, label: "Daily Streaks", value: "5K+", color: "from-orange-500 to-rose-500" },
          ].map((stat, i) => (
            <StatCounter key={i} {...stat} delay={0.5 + i * 0.15} />
          ))}
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-16"
        >
          {[
            {
              title: "Live Quiz Battles",
              desc: "Answer questions in real-time and see how well you match your partner.",
              icon: "⚡",
            },
            {
              title: "Memory Timeline",
              desc: "Revisit past quizzes and relive your journey together.",
              icon: "📸",
            },
            {
              title: "Streak & Achievements",
              desc: "Build habits, earn rewards, and celebrate your bond.",
              icon: "🏆",
            },
          ].map((card, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.04, y: -6 }}
              className="group relative rounded-[2rem] border border-white/10 bg-white/5 p-6 text-left shadow-lg backdrop-blur-md transition-all duration-300 hover:border-rose-500/40 hover:shadow-[0_0_30px_rgba(244,63,94,0.25)]"
            >
              <div className="text-4xl mb-4">{card.icon}</div>
              <h3 className="font-serif italic text-xl text-[#F8FAFC] mb-2 transition-colors group-hover:text-rose-300">{card.title}</h3>
              <p className="text-sm text-indigo-200/60 font-light">{card.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Secondary CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.1 }}
          className="mt-16"
        >
          <button className="bg-white/10 hover:bg-white/20 text-white font-bold uppercase tracking-[0.2em] text-sm py-4 px-10 rounded-full transition-all border border-white/10 hover:border-rose-500/40 hover:shadow-[0_0_30px_rgba(244,63,94,0.3)]">
            Get Started Free
          </button>
        </motion.div>
      </motion.section>
    </div>
  );
}

function StatCounter({ icon: Icon, label, value, color, delay }: { icon: any; label: string; value: string; color: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay }}
      className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 shadow-md backdrop-blur-sm"
    >
      <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${color} text-white shadow-lg`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="text-left">
        <p className="text-[10px] uppercase tracking-widest text-indigo-300">{label}</p>
        <p className="text-xl font-bold text-[#F8FAFC]">{value}</p>
      </div>
    </motion.div>
  );
}