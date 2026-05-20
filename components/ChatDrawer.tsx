import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { X, Send } from 'lucide-react';
import { collection, query, orderBy, onSnapshot, addDoc, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './AuthProvider';
import { handleFirestoreError, OperationType } from '@/lib/firestore-errors';

export default function ChatDrawer({ coupleId, onClose }: { coupleId: string, onClose: () => void }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query(collection(db, `couples/${coupleId}/messages`), orderBy('createdAt', 'asc'), limit(100));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }, (error) => {
       handleFirestoreError(error, OperationType.LIST, `couples/${coupleId}/messages`, user);
    });
    return () => unsubscribe();
  }, [coupleId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !user) return;
    const msg = text.trim();
    setText('');
    try {
      await addDoc(collection(db, `couples/${coupleId}/messages`), {
        senderId: user.uid,
        text: msg,
        createdAt: Date.now()
      });
    } catch (err) {
       handleFirestoreError(err, OperationType.CREATE, `couples/${coupleId}/messages`, user);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed bottom-6 right-6 w-80 h-96 bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50"
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-200 flex items-center justify-between pb-3">
        <h3 className="font-semibold text-lg text-slate-800">Partner Chat</h3>
        <button onClick={onClose} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Message list */}
      <div className="flex-1 overflow-y-auto bg-slate-50 px-4 py-2 space-y-4">
        {messages.map((m) => {
          const isMe = m.senderId === user?.uid;
          return (
            <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 ${isMe ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-gray-100 text-slate-800'}`}
              >
                <p className="text-sm break-words">{m.text}</p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <form onSubmit={handleSend} className="p-4 border-t border-slate-200">
        <div className="relative">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type a message..."
              className="w-full bg-slate-100 text-slate-800 border border-gray-200 rounded-full py-3 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400"
            />
            <button
              type="submit"
              disabled={!text.trim()}
              className="absolute right-2 top-2 p-1.5 bg-indigo-600 text-white rounded-full disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
        </div>
      </form>
    </motion.div>
  );
}
