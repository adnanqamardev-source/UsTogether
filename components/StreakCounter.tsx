"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Flame } from "lucide-react";

type StreakCounterProps = {
  streak?: number;
  label?: string;
};

export default function StreakCounter({ streak = 0, label = "Day Streak" }: StreakCounterProps) {
  const [ignite, setIgnite] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setIgnite(true), 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur-md overflow-hidden"
    >
      {/* animated gradient border glow */}
      <div
        className="absolute inset-0 rounded-[2rem] opacity-60 pointer-events-none"
        style={{
          background: ignite
            ? "linear-gradient(135deg, rgba(244,63,94,0.4), rgba(251,146,60,0.3), rgba(168,85,247,0.25))"
            : "linear-gradient(135deg, rgba(244,63,94,0.1), rgba(168,85,247,0.05))",
          padding: "1px",
          WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
          transition: "background 0.8s ease",
        }}
      />

      <div className="flex items-center gap-3 relative z-10">
        <div className="relative">
          <motion.div
            animate={ignite ? { scale: [1, 1.15, 1], rotate: [-5, 5, 0] } : {}}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-500/20 text-rose-400"
          >
            <Flame className="h-5 w-5" />
          </motion.div>
          {ignite && (
            <motion.span
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0.8, 1.3, 1], opacity: [0, 1, 0.8] }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="absolute -top-2 -right-2 text-lg"
            >
              🔥
            </motion.span>
          )}
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-indigo-300">{label}</p>
          <p className="text-3xl font-bold text-[#F8FAFC]">{streak}</p>
        </div>
      </div>

      {/* progress bar */}
      <div className="mt-4 h-1.5 w-full rounded-full bg-white/5 relative z-10">
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="h-full rounded-full bg-gradient-to-r from-rose-500 via-orange-500 to-rose-500 origin-left"
          style={{ width: `${Math.min((streak % 7) / 7 * 100, 100)}%` }}
        />
      </div>
    </motion.div>
  );
}