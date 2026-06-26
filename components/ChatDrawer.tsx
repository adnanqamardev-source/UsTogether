"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { useFirestoreCollection, addMessage } from '@/lib/firebase';
import { orderBy } from 'firebase/firestore';
import type { ChatMessage } from '../global.d';

export default function ChatDrawer({ coupleId, onClose }: { coupleId: string; onClose: () => void }) {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: messages } = useFirestoreCollection<ChatMessage>(
    ['couples', coupleId, 'messages'],
    [orderBy('timestamp', 'asc')],
    (id, data) => ({
      id,
      senderId: data.senderId,
      text: data.text,
      timestamp: new Date((data.timestamp?.toDate?.() ?? data.timestamp ?? Date.now()) as number),
    } as ChatMessage)
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !user || !coupleId) return;
    try {
      await addMessage(coupleId, { senderId: user.uid, text: text.trim() });
      setText('');
      setIsTyping(false);
    } catch (err) {
      console.error('Send message failed', err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="h-full w-full bg-[#0F0A1F] border-l border-white/10 shadow-2xl flex flex-col overflow-hidden"
    >
      <div className="p-4 border-b border-white/10 flex items-center justify-between pb-3">
        <div>
          <h3 className="font-semibold text-lg text-white">Partner Chat</h3>
          <p className="text-[11px] text-indigo-300 tracking-wide">Real-time messages</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-white/50 hover:bg-white/10 hover:text-white rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-4">
        <AnimatePresence>
          {messages.map((m) => {
            const isMe = m.senderId === user?.uid;
            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 12, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ type: 'spring', damping: 18, stiffness: 120 }}
                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 shadow-md ${
                    isMe
                      ? 'bg-gradient-to-br from-indigo-600 to-rose-600 text-white rounded-br-none'
                      : 'bg-white/10 text-white rounded-bl-none'
                  }`}
                >
                  <p className="text-sm break-words">{m.text}</p>
                  <p className={`mt-1 text-[10px] ${isMe ? 'text-white/70' : 'text-white/50'}`}>
                    {m.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-white/60 text-xs px-2"
          >
            <span className="inline-flex items-center gap-1 bg-white/5 border border-white/10 rounded-full px-3 py-1.5">
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" />
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '100ms' }} />
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
              Partner is typing...
            </span>
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="p-4 border-t border-white/10">
        <div className="relative">
          <input
            type="text"
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setIsTyping(e.target.value.trim().length > 0);
            }}
            placeholder="Type a message..."
            className="w-full bg-white/5 text-white border border-white/10 rounded-full py-3 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-rose-500 placeholder:text-white/40"
          />
          <button
            type="submit"
            disabled={!text.trim()}
            className="absolute right-2 top-2 p-1.5 bg-rose-500 text-white rounded-full disabled:opacity-50 hover:bg-rose-600 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </motion.div>
  );
}