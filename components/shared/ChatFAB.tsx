"use client";

import { motion } from 'motion/react';
import { MessageCircle } from 'lucide-react';

export default function ChatFAB({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.9 }}
      className="fixed bottom-24 right-5 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-rose-500 to-indigo-600 text-white shadow-2xl shadow-rose-500/30 flex items-center justify-center md:hidden"
      aria-label="Open chat"
    >
      <MessageCircle className="w-6 h-6" />
      <span className="absolute inset-0 rounded-full animate-ping bg-rose-400/40" />
    </motion.button>
  );
}