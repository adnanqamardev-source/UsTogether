"use client";

import { motion } from 'motion/react';
import { Home, Trophy, Images, MessageCircle } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

type NavItem = {
  label: string;
  icon: React.ElementType;
  href: string;
  active?: boolean;
};

const navItems: NavItem[] = [
  { label: 'Home', icon: Home, href: '#', active: true },
  { label: 'Achievements', icon: Trophy, href: '#stats' },
  { label: 'Memories', icon: Images, href: '#memories' },
  { label: 'Chat', icon: MessageCircle, href: '#chat' },
];

export default function BottomNav({ onChatClick }: { onChatClick: () => void }) {
  const isMobile = useIsMobile();
  
  if (!isMobile) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 pb-safe">
      <div className="max-w-lg mx-auto px-4 pt-2 pb-4">
        <div className="relative flex items-center justify-around bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-[2rem] shadow-2xl shadow-black/40 px-2 py-2">
          {navItems.map((item) => {
            const isChat = item.label === 'Chat';
            return (
              <button
                key={item.label}
                onClick={isChat ? onChatClick : undefined}
                className={`relative flex flex-col items-center gap-1 p-2 rounded-2xl transition-colors ${
                  item.active ? 'text-rose-400' : 'text-slate-400 hover:text-white'
                }`}
                aria-label={item.label}
              >
                {item.active && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-rose-500 rounded-full"
                    transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                  />
                )}
                <item.icon className="w-5 h-5" />
                <span className="text-[10px] font-medium uppercase tracking-wider">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}