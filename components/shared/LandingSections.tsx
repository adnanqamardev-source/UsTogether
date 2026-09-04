"use client";

import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Users, Trophy, Flame, Play, Sparkles, Heart, Activity, ArrowRight, Zap, Target, Lock, Gift, Clock, CalendarDays } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export default function LandingSections({ onGetStarted }: { onGetStarted?: () => void }) {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  
  // Interactive Quiz Demo State
  const [activeQuestion, setActiveQuestion] = useState(0);
  const [partnerAnswer, setPartnerAnswer] = useState<number | null>(null);
  
  const quizDemo = [
    {
      q: "Where was our first date?",
      options: ["Coffee Shop", "Italian Restaurant", "Movie Theater", "Park Walk"],
      partnerChoice: 1
    },
    {
      q: "What is my absolute favorite dessert?",
      options: ["Tiramisu", "Ice Cream", "Brownies", "Cheesecake"],
      partnerChoice: 0
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setPartnerAnswer(null);
      setActiveQuestion(prev => (prev + 1) % quizDemo.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPartnerAnswer(quizDemo[activeQuestion].partnerChoice);
    }, 2000);
    return () => clearTimeout(timer);
  }, [activeQuestion]);

  return (
    <div className="relative overflow-visible w-full">
      {/* Background Ambience */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <motion.div 
          style={{ y }}
          className="absolute -top-[10%] left-[10%] h-[40rem] w-[40rem] rounded-full bg-rose-500/10 blur-[140px]" 
        />
        <motion.div 
          style={{ y: useTransform(scrollYProgress, [0, 1], [0, -100]) }}
          className="absolute top-[20%] right-[5%] h-[35rem] w-[35rem] rounded-full bg-indigo-500/10 blur-[130px]" 
        />
      </div>

      <div className="max-w-5xl mx-auto space-y-32 pb-24">
        
        {/* HERO SECTION */}
        <section className="relative z-10 pt-16 md:pt-24 text-center space-y-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-rose-500/30 bg-rose-500/10 text-rose-300 text-sm font-medium mb-4 backdrop-blur-md"
          >
            <Sparkles className="w-4 h-4" />
            <span>Join 12,000+ couples strengthening their bond</span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white via-slate-100 to-indigo-200 leading-[1.1] pb-2 text-balance"
          >
            How well do you <br/>
            <span className="italic font-serif text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-indigo-400">truly</span> know them?
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25 }}
            className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto font-light leading-relaxed text-balance"
          >
            Turn your shared history into a playful daily ritual. Compete in personalized quizzes, build memory timelines, and celebrate what makes you Us.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <button 
              onClick={onGetStarted}
              className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-indigo-950 rounded-full font-bold text-lg overflow-hidden transition-transform active:scale-95 hover:scale-105"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-rose-100 to-indigo-100 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative">Start Your Journey — Free</span>
              <ArrowRight className="relative w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <p className="text-sm text-slate-400 mt-2 sm:mt-0 font-mono tracking-tight">No credit card required</p>
          </motion.div>
        </section>

        {/* INTERACTIVE DEMO */}
        <motion.section 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="relative max-w-4xl mx-auto"
        >
          <div className="absolute -inset-0.5 bg-gradient-to-r from-rose-500 to-indigo-500 rounded-3xl opacity-20 blur-xl" />
          <div className="relative bg-[#0d0a1c] border border-white/10 rounded-3xl p-6 md:p-10 shadow-2xl overflow-hidden backdrop-blur-xl">
            {/* Window controls mac style */}
            <div className="flex gap-2 mb-8 border-b border-white/5 pb-6">
              <div className="w-3 h-3 rounded-full bg-rose-500/50" />
              <div className="w-3 h-3 rounded-full bg-amber-500/50" />
              <div className="w-3 h-3 rounded-full bg-green-500/50" />
            </div>

            <div className="flex flex-col md:flex-row gap-10 items-center">
              <div className="flex-1 w-full space-y-6">
                <div className="inline-flex items-center gap-2 text-rose-400 font-mono text-sm tracking-widest uppercase mb-2">
                  <Activity className="w-4 h-4" /> Live Match
                </div>
                
                <div className="h-[120px]">
                  <AnimatePresence mode="wait">
                    <motion.h3 
                      key={activeQuestion}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="text-2xl md:text-3xl font-medium text-white"
                    >
                      {quizDemo[activeQuestion].q}
                    </motion.h3>
                  </AnimatePresence>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 relative">
                  {quizDemo[activeQuestion].options.map((opt, i) => (
                    <div 
                      key={opt} 
                      className={cn(
                        "relative p-4 rounded-xl border transition-all duration-500",
                        partnerAnswer === i 
                          ? "border-rose-500 bg-rose-500/20 shadow-[0_0_20px_rgba(244,63,94,0.3)]" 
                          : "border-white/10 bg-white/5"
                      )}
                    >
                      <span className="text-slate-200 font-medium">{opt}</span>
                      
                      {/* Partner cursor indicator */}
                      <AnimatePresence>
                        {partnerAnswer === i && (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0 }}
                            className="absolute -right-2 -top-2 bg-rose-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg flex items-center gap-1 z-10"
                          >
                            <Heart className="w-3 h-3 fill-current" /> Riley answered
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* STATS SECTION */}
        <section className="py-10 border-y border-white/5 flex flex-wrap justify-center gap-x-16 gap-y-10">
          {[
            { icon: Users, label: "Couples Playing", value: "12,450+", color: "text-rose-400" },
            { icon: Trophy, label: "Quizzes Completed", value: "850K+", color: "text-indigo-400" },
            { icon: Flame, label: "Longest Streak", value: "342 Days", color: "text-amber-400" },
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className="flex items-center gap-4"
            >
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <stat.icon className="w-6 h-6" />
              </div>
              <div className="text-left">
                <p className="font-mono text-xs text-slate-400 uppercase tracking-widest">{stat.label}</p>
                <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 mt-1">{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </section>

        {/* FEATURES GRID */}
        <section className="space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">More than just questions.</h2>
            <p className="text-lg text-slate-400">Everything you need to spark conversation, reminisce, and grow closer every day.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              className="group relative p-8 rounded-3xl bg-white/5 border border-white/10 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <Zap className="w-10 h-10 text-indigo-400 mb-6" />
              <h3 className="text-2xl font-bold text-white mb-3">Live Battles</h3>
              <p className="text-slate-400 leading-relaxed">
                Connect in real-time. See your partner typing, guessing, and reacting synchronously, no matter the distance between you.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              whileHover={{ y: -5 }}
              className="group relative p-8 rounded-3xl bg-white/5 border border-white/10 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-rose-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CalendarDays className="w-10 h-10 text-rose-400 mb-6" />
              <h3 className="text-2xl font-bold text-white mb-3">Memory Timeline</h3>
              <p className="text-slate-400 leading-relaxed">
                Your relationship, documented dynamically. Every answer becomes a stepping stone in a secure, private timeline of your journey.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              whileHover={{ y: -5 }}
              className="group relative p-8 rounded-3xl bg-white/5 border border-white/10 overflow-hidden md:col-span-2 lg:col-span-1"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <Target className="w-10 h-10 text-amber-400 mb-6" />
              <h3 className="text-2xl font-bold text-white mb-3">Streaks & Rewards</h3>
              <p className="text-slate-400 leading-relaxed">
                Build healthy communication habits. Earn achievements, unlock new quiz categories, and celebrate milestones together.
              </p>
            </motion.div>
          </div>
        </section>

        {/* BOTTOM CTA */}
        <motion.section 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative rounded-[3rem] overflow-hidden p-12 md:p-20 text-center border border-white/10"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 via-[#0d0a1c] to-rose-900/30" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500/20 via-transparent to-transparent" />
          
          <div className="relative z-10 space-y-8 max-w-2xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-6">
              Ready to grow <span className="italic font-serif text-rose-300">closer?</span>
            </h2>
            <p className="text-xl text-slate-300 font-light mb-10">
              Join thousands of couples intentionally investing in their relationship daily. It takes less than 5 minutes a day.
            </p>
            <button 
              onClick={onGetStarted}
              className="group inline-flex items-center justify-center gap-3 px-10 py-5 bg-gradient-to-r from-rose-500 to-indigo-600 text-white rounded-full font-bold text-xl shadow-[0_0_40px_rgba(99,102,241,0.4)] hover:shadow-[0_0_60px_rgba(244,63,94,0.6)] transition-all hover:-translate-y-1 active:translate-y-0"
            >
              <span>Get Started Now</span>
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
            <div className="flex items-center justify-center gap-6 mt-8">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Lock className="w-4 h-4" /> Secure & Private
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Gift className="w-4 h-4" /> Always Free Core
              </div>
            </div>
          </div>
        </motion.section>

      </div>
    </div>
  );
}
