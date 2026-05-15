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
    <>
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 md:hidden"
        onClick={onClose}
      />
      <motion.div 
        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed right-0 top-0 bottom-0 w-full md:w-96 bg-white shadow-2xl z-50 flex flex-col border-l border-gray-100"
      >
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-lg">Partner Chat</h3>
          <button onClick={onClose} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m) => {
            const isMe = m.senderId === user?.uid;
            return (
              <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${isMe ? 'bg-rose-500 text-white rounded-tr-sm' : 'bg-gray-100 text-slate-800 rounded-tl-sm'}`}>
                  <p className="text-sm">{m.text}</p>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={handleSend} className="p-4 border-t border-gray-100">
          <div className="relative">
            <input 
              type="text" 
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type a message..."
              className="w-full border border-gray-200 rounded-full py-3 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-rose-500/50"
            />
            <button 
              type="submit" 
              disabled={!text.trim()}
              className="absolute right-2 top-2 p-1.5 bg-rose-500 text-white rounded-full disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </motion.div>
    </>
  );
}
