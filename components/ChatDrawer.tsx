import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Send } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { handleFirestoreError, OperationType } from '@/lib/firestore-errors';

interface Message {
  id: string;
  text: string;
  senderId: string;
  timestamp: Date;
}

interface ChatDrawerProps {
  coupleId: string;
  onClose: () => void;
}

export default function ChatDrawer({ coupleId, onClose }: ChatDrawerProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!coupleId) return;
    const q = query(collection(db, 'couples', coupleId, 'messages'), orderBy('timestamp'));
    const unsub = onSnapshot(q, (snapshot) => {
      const msgs: Message[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        text: doc.data().text,
        senderId: doc.data().senderId,
        timestamp: doc.data().timestamp?.toDate() || new Date(),
      }));
      setMessages(msgs);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, `couples/${coupleId}/messages`);
    });
    return () => unsub();
  }, [coupleId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !user || !coupleId) return;
    try {
      await addDoc(collection(db, 'couples', coupleId, 'messages'), {
        text: text.trim(),
        senderId: user.uid,
        timestamp: serverTimestamp(),
      });
      setText('');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `couples/${coupleId}/messages`);
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
        <button onClick={onClose} className="p-2 text-white/50 hover:bg-white/10 hover:text-white rounded-full transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-4">
        {messages.map((m) => {
          const isMe = m.senderId === user?.uid;
          return (
            <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                  isMe ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white/10 text-white'
                }`}
              >
                <p className="text-sm break-words">{m.text}</p>
                <p className="mt-1 text-[10px] text-white/50">
                  {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="p-4 border-t border-white/10">
        <div className="relative">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
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