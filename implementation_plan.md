### 1. Global Styles & Animations

**`app/globals.css`**
Added the requested `bounce-in` and `float` animations, an enhanced scrollbar gradient, and a global focus-visible ring utility.

```css
@import "tailwindcss";

@plugin "tailwindcss-animate";

@custom-variant dark (&:is(.dark *));

@theme {
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
  
  --animate-float: float 4s ease-in-out infinite;
  --animate-bounce-in: bounce-in 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
  --animate-pulse-fast: pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  --animate-gradient-shift: gradient-shift 3s ease infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

@keyframes bounce-in {
  0% { opacity: 0; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.05); }
  70% { transform: scale(0.95); }
  100% { transform: scale(1); }
}

@keyframes gradient-shift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  /* ... keep existing root variables ... */
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  /* ... keep existing dark variables ... */
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
  
  /* Global Focus Visible */
  *:focus-visible {
    @apply outline-none ring-2 ring-indigo-500 ring-offset-2 ring-offset-slate-950 transition-shadow;
  }
}

/* Custom Scrollbar */
::-webkit-scrollbar {
  width: 8px;
}
::-webkit-scrollbar-track {
  @apply bg-slate-900/50;
}
::-webkit-scrollbar-thumb {
  @apply bg-gradient-to-b from-indigo-500/80 to-purple-500/80 rounded-full hover:from-indigo-400 hover:to-purple-400 transition-colors;
}

```

---

### 2. Layout & Landing Improvements

**`app/page.tsx`**
Updated the footer to include richer links and social icons.

```tsx
import LandingSections from '@/components/LandingSections';
import { Github, Twitter, Heart } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0A0514] text-slate-200 selection:bg-rose-500/30 flex flex-col">
      <main className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 relative overflow-hidden">
        <LandingSections />
      </main>

      <footer className="w-full border-t border-white/5 bg-slate-950/50 backdrop-blur-md py-8 mt-auto">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-400">
          <p className="flex items-center gap-1">
            Made with <Heart size={14} className="text-rose-500 animate-pulse-fast" /> by UsTogether © {new Date().getFullYear()}
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-indigo-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-indigo-400 transition-colors">Terms of Service</a>
            <div className="flex items-center gap-3 ml-4">
              <a href="#" aria-label="Twitter" className="hover:text-sky-400 transition-colors"><Twitter size={18} /></a>
              <a href="#" aria-label="GitHub" className="hover:text-white transition-colors"><Github size={18} /></a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

```

**`components/LandingSections.tsx`**
Added feature highlight cards, an animated stats counter, and a secondary CTA button using staggered `motion.div` wrappers.

```tsx
'use client';

import { motion, useInView } from 'framer-motion';
import { ArrowRight, Heart, Shield, Zap } from 'lucide-react';
import Link from 'next/link';
import { useRef, useEffect, useState } from 'react';

const AnimatedCounter = ({ end, label }: { end: number, label: string }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const duration = 2000;
      const increment = end / (duration / 16);
      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 16);
      return () => clearInterval(timer);
    }
  }, [isInView, end]);

  return (
    <div ref={ref} className="text-center p-4">
      <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-rose-400 to-indigo-400 bg-clip-text text-transparent mb-2">
        {count}+
      </div>
      <div className="text-slate-400 text-sm font-medium uppercase tracking-wider">{label}</div>
    </div>
  );
};

const FeatureCard = ({ icon: Icon, title, description }: any) => (
  <motion.div 
    whileHover={{ y: -5, scale: 1.02 }}
    className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm relative overflow-hidden group"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center mb-4 border border-indigo-500/30">
      <Icon className="text-indigo-300" size={24} />
    </div>
    <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
    <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
  </motion.div>
);

export default function LandingSections() {
  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-24 py-12">
      {/* Hero Section */}
      <section className="text-center space-y-8 flex flex-col items-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium mb-4"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
          Now available for couples worldwide
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-7xl font-extrabold tracking-tight"
        >
          Grow Closer, <span className="bg-gradient-to-r from-rose-400 via-purple-400 to-indigo-400 text-transparent bg-clip-text animate-gradient-shift bg-[length:200%_auto]">Together.</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto"
        >
          Discover new dimensions of your relationship through interactive quizzes, shared memories, and meaningful daily challenges.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 pt-4"
        >
          <Link href="/dashboard" className="px-8 py-4 rounded-full bg-white text-black font-semibold hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 group">
            Get Started <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link href="#features" className="px-8 py-4 rounded-full bg-white/5 text-white font-semibold hover:bg-white/10 border border-white/10 transition-colors flex items-center justify-center">
            How it works
          </Link>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 border-y border-white/5 py-12 bg-white/[0.02]">
        <AnimatedCounter end={50000} label="Couples Joined" />
        <AnimatedCounter end={1200} label="Quizzes Taken" />
        <AnimatedCounter end={250000} label="Memories Shared" />
      </section>

      {/* Features Section */}
      <section id="features" className="space-y-12">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to connect</h2>
          <p className="text-slate-400 max-w-xl mx-auto">A beautifully designed space dedicated entirely to you and your partner.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard 
            icon={Zap} 
            title="Daily Streaks" 
            description="Build a habit of connection. Keep your streak alive by checking in, answering questions, or sending a quick memory every day." 
          />
          <FeatureCard 
            icon={Heart} 
            title="Couples Quizzes" 
            description="From deep, meaningful questions to lighthearted trivia. See how well you really know each other with real-time syncing." 
          />
          <FeatureCard 
            icon={Shield} 
            title="Private & Secure" 
            description="Your memories and answers are end-to-end encrypted. A safe, secure vault that belongs exclusively to the two of you." 
          />
        </div>
      </section>
    </div>
  );
}

```

---

### 3. Core Dashboard Structure & Mobile Nav

**`components/CoupleDashboard.tsx`**
Added the `isMobileMenuOpen` state, a `MobileMenu` sub-component, and adjusted the grid spacing per the implementation plan (addressing the missing mobile nav in **asSQ.PNG**).

```tsx
'use client';

import { useState } from 'react';
import { Menu, X, LogOut, Link2Off } from 'lucide-react';
// ... other imports remain exactly the same ...

export default function CoupleDashboard({ user, pairData, onLogout }: any) {
  const [view, setView] = useState<'quizzes' | 'memories'>('quizzes');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // ... (keep auth/unpair logic identical)

  return (
    <div className="w-full max-w-5xl mx-auto px-4 md:px-8 py-6 md:py-10 animate-in fade-in duration-500">
      <nav className="flex justify-between items-center mb-8 relative">
        <div className="flex gap-8 items-center">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-indigo-600 flex items-center justify-center font-bold text-lg shadow-lg shadow-indigo-500/20">
            U
          </div>
          <div className="hidden md:flex gap-6 border-b border-white/10 pb-1">
            <button
              onClick={() => setView('quizzes')}
              className={`text-sm font-medium transition-colors ${view === 'quizzes' ? 'text-rose-400 border-b-2 border-rose-400 pb-1' : 'text-slate-400 hover:text-white'}`}
            >
              QUIZZES
            </button>
            <button
              onClick={() => setView('memories')}
              className={`text-sm font-medium transition-colors ${view === 'memories' ? 'text-rose-400 border-b-2 border-rose-400 pb-1' : 'text-slate-400 hover:text-white'}`}
            >
              MEMORIES
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4 md:gap-6">
          <button onClick={() => {/* Handle Unpair */}} className="hidden md:flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-rose-400 transition-colors">
            <Link2Off size={14} /> DISCONNECT
          </button>
          <button onClick={onLogout} className="hidden md:block text-xs font-medium text-slate-400 hover:text-white transition-colors">
            LOG OUT
          </button>
          <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold shadow-md">
            {user?.displayName?.charAt(0) || user?.email?.charAt(0) || '?'}
          </div>
          
          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 text-slate-300 hover:text-white transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden flex flex-col gap-4 mb-8 p-5 bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-white/10 animate-bounce-in shadow-2xl">
          <button onClick={() => { setView('quizzes'); setIsMobileMenuOpen(false); }} className={`text-left font-medium p-2 rounded-lg ${view === 'quizzes' ? 'bg-white/10 text-rose-400' : 'text-slate-300'}`}>Quizzes</button>
          <button onClick={() => { setView('memories'); setIsMobileMenuOpen(false); }} className={`text-left font-medium p-2 rounded-lg ${view === 'memories' ? 'bg-white/10 text-rose-400' : 'text-slate-300'}`}>Memories</button>
          <hr className="border-white/5 my-2" />
          <button className="text-left font-medium p-2 text-slate-400 flex items-center gap-2"><Link2Off size={16} /> Disconnect Partner</button>
          <button onClick={onLogout} className="text-left font-medium p-2 text-slate-400 flex items-center gap-2"><LogOut size={16} /> Log Out</button>
        </div>
      )}

      {/* Hero & Widgets Row */}
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-8">
          Hi, <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-100 to-indigo-200">{user?.displayName?.split(' ')[0] || 'there'}</span> ☁️
        </h1>
        
        {/* Improved grid spacing */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          <StreakCounter pairId={pairData.id} />
          <AchievementsPanel pairId={pairData.id} />
        </div>
      </div>

      <main className="mt-8">
        {view === 'quizzes' ? <QuizList pairId={pairData.id} currentUserId={user.uid} /> : <MemoryBoard pairId={pairData.id} currentUserId={user.uid} />}
      </main>

      <ChatDrawer pairId={pairData.id} currentUserId={user.uid} />
    </div>
  );
}

```

---

### 4. Component Polish (Widgets & Quizzes)

**`components/QuizCard.tsx`**
Added `isHovering` state for a tilt effect, gradient border animations, and improved styling.

```tsx
'use client';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import { useState } from 'react';

export default function QuizCard({ quiz, onStart }: any) {
  const [isHovering, setIsHovering] = useState(false);

  return (
    <motion.div 
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      animate={{ 
        y: isHovering ? -5 : 0,
        rotateX: isHovering ? 2 : 0,
        rotateY: isHovering ? -2 : 0
      }}
      className="group relative flex flex-col p-6 rounded-2xl bg-slate-900/40 border border-white/5 backdrop-blur-sm overflow-hidden h-full transition-shadow hover:shadow-xl hover:shadow-indigo-500/10"
    >
      {/* Animated Gradient Border Overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br from-rose-500/20 to-indigo-500/20 opacity-0 transition-opacity duration-500 ${isHovering ? 'opacity-100' : ''}`} style={{ mixBlendMode: 'overlay' }} />
      
      <h3 className="text-xl font-semibold text-white mb-3 italic">{quiz.title}</h3>
      <p className="text-slate-400 text-sm mb-6 flex-grow">{quiz.description}</p>
      
      <button 
        onClick={() => onStart(quiz.id)}
        className="w-full py-3 rounded-xl bg-white/5 hover:bg-gradient-to-r hover:from-indigo-500 hover:to-purple-500 text-white font-medium flex items-center justify-center gap-2 transition-all border border-white/10 group-hover:border-transparent"
      >
        <Play size={16} className={isHovering ? 'animate-pulse-fast' : ''} /> 
        Start Quiz
      </button>
    </motion.div>
  );
}

```

**`components/QuizList.tsx`**
Extracted `SectionHeader` and added count badges.

```tsx
'use client';
// ... imports

const SectionHeader = ({ title, count, action }: { title: string, count: number, action?: React.ReactNode }) => (
  <div className="flex items-center justify-between mb-6">
    <div className="flex items-center gap-3">
      <h2 className="text-sm font-bold tracking-[0.2em] text-slate-400 uppercase">{title}</h2>
      <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">
        {count}
      </span>
    </div>
    {action}
  </div>
);

export default function QuizList({ pairId, currentUserId }: any) {
  // ... state/effects remain the same
  
  return (
    <div className="space-y-12 animate-in slide-in-from-bottom-4 duration-700">
      {activeSessions.length > 0 && (
        <section>
          <SectionHeader title="Live Sessions" count={activeSessions.length} />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Live session cards improved styling */}
            {activeSessions.map(session => (
              <div key={session.id} className="p-1 rounded-2xl bg-gradient-to-r from-rose-500 to-indigo-500 animate-pulse-fast">
                <div className="bg-slate-900 rounded-xl h-full p-5 flex flex-col justify-between">
                   {/* ... internal session card details ... */}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <SectionHeader 
          title="Featured Quizzes" 
          count={quizzes.length} 
          action={<button className="text-xs text-rose-400 hover:text-rose-300 uppercase tracking-widest font-semibold flex items-center gap-1"><Sparkles size={14}/> Fetch New</button>} 
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map(quiz => (
            <QuizCard key={quiz.id} quiz={quiz} onStart={handleStartQuiz} />
          ))}
        </div>
      </section>
    </div>
  );
}

```

**`components/ActiveSession.tsx`**
Refined empty/loading messaging, replaced Force Next with ghost styling, and added a celebratory overlay.

```tsx
// ... inside ActiveSession component render ...
  if (bothAnswered) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl mx-auto p-8 bg-slate-900 border border-indigo-500/30 rounded-3xl text-center relative overflow-hidden"
      >
        {/* Celebration Confetti Effect Overlay */}
        <div className="absolute inset-0 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 animate-pulse" />
        
        <h3 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-indigo-400">
          Results are in! 🎉
        </h3>
        {/* ... answers rendering ... */}
        <button 
          onClick={handleNextQuestion}
          className="w-full py-4 mt-8 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/25 transition-all"
        >
          {isLastQuestion ? 'Finish Quiz' : 'Next Question'}
        </button>
      </motion.div>
    );
  }

  // Ghost styling for force next:
  // <button onClick={handleNextQuestion} className="w-full py-3 mt-4 bg-transparent border border-white/10 hover:bg-white/5 text-slate-400 rounded-xl text-sm font-medium transition-colors">Force Next</button>

```

**`components/StreakCounter.tsx`**
Added a mount pulse effect, progress bar, and gradient backgrounds.

```tsx
'use client';
import { Flame } from 'lucide-react';
import { useEffect, useState } from 'react';
// ... imports

export default function StreakCounter({ pairId }: { pairId: string }) {
  const [streak, setStreak] = useState(0);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    // ... fetch logic ...
    setPulse(true);
    const t = setTimeout(() => setPulse(false), 1000);
    return () => clearTimeout(t);
  }, []); // or when streak updates

  return (
    <div className="relative p-6 rounded-2xl bg-slate-900/60 border border-white/5 overflow-hidden group hover:border-orange-500/30 transition-colors">
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-rose-500/5" />
      <div className="flex items-center gap-4 relative z-10">
        <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
          <Flame className={`text-orange-500 ${pulse ? 'animate-bounce' : 'group-hover:animate-pulse-fast'}`} size={24} />
        </div>
        <div>
          <h3 className="text-xs font-bold tracking-[0.2em] text-slate-400 uppercase mb-1">Day Streak</h3>
          <div className="text-3xl font-bold text-white flex items-center gap-2">
            {streak} <span className={pulse ? 'scale-125 transition-transform' : ''}>🔥</span>
          </div>
        </div>
      </div>
      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-slate-800 rounded-full mt-4 overflow-hidden relative z-10">
        <div className="h-full bg-gradient-to-r from-orange-500 to-rose-500 w-[75%]" />
      </div>
    </div>
  );
}

```

**`components/AchievementsPanel.tsx`**
Expanded the list, added `showAll` state, and trophy glow.

```tsx
'use client';
import { Trophy, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
// ... imports

export default function AchievementsPanel({ pairId }: { pairId: string }) {
  const [showAll, setShowAll] = useState(false);
  const achievements = []; // Fetched data
  const visibleCount = showAll ? achievements.length : 5;

  return (
    <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/5 relative overflow-hidden group hover:border-indigo-500/30 transition-colors">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5" />
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 group-hover:shadow-[0_0_15px_rgba(99,102,241,0.4)] transition-shadow">
            <Trophy className="text-indigo-400" size={24} />
          </div>
          <div>
             <h3 className="text-xs font-bold tracking-[0.2em] text-slate-400 uppercase mb-1">Achievements</h3>
             <div className="text-3xl font-bold text-white">{achievements.length}</div>
          </div>
        </div>
        {achievements.length > 5 && (
          <button onClick={() => setShowAll(!showAll)} className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 bg-indigo-500/10 px-2 py-1 rounded-md">
            {showAll ? <><ChevronUp size={14}/> Less</> : <><ChevronDown size={14}/> View All</>}
          </button>
        )}
      </div>
      {/* ... mapping over achievements.slice(0, visibleCount) ... */}
    </div>
  );
}

```

**`components/MemoryBoard.tsx`**
Upgraded date formatting using `Intl.DateTimeFormat`.

```tsx
// Inside MemoryBoard:
const formatDate = (date: any) => {
  if (!date) return '';
  const d = date.toDate ? date.toDate() : new Date(date);
  return new Intl.DateTimeFormat('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  }).format(d);
};

// Render logic:
// <div className="group relative p-4 rounded-xl bg-slate-800/50 border border-white/5 hover:border-rose-500/30 hover:bg-slate-800 transition-all cursor-pointer">
//   <div className="absolute inset-0 bg-gradient-to-b from-transparent to-rose-500/5 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity" />
//   <p className="text-slate-300 relative z-10">{memory.text}</p>
//   <span className="text-xs text-slate-500 mt-2 block relative z-10">{formatDate(memory.createdAt)}</span>
// </div>

```

**`components/ChatDrawer.tsx`**
Added dummy `isTyping` state and animated message bubbles.

```tsx
'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
// ... imports

export default function ChatDrawer({ pairId, currentUserId }: any) {
  // ... existing chat logic ...
  const [isTyping, setIsTyping] = useState(false); // Dummy state for UX polish

  return (
    // ... drawer container ...
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <AnimatePresence initial={false}>
        {messages.map((msg: any) => {
          const isMine = msg.senderId === currentUserId;
          return (
            <motion.div 
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] p-3 rounded-2xl ${
                isMine 
                  ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-br-sm' 
                  : 'bg-slate-800 text-slate-200 border border-white/10 rounded-bl-sm'
              }`}>
                <p className="text-sm">{msg.text}</p>
                <span className="text-[10px] opacity-50 mt-1 block text-right">
                   {msg.createdAt?.toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
              </div>
            </motion.div>
          );
        })}
        {isTyping && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex justify-start">
            <div className="bg-slate-800 border border-white/10 p-3 rounded-2xl rounded-bl-sm flex gap-1 items-center">
               <div className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" />
               <div className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce delay-75" />
               <div className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce delay-150" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

```