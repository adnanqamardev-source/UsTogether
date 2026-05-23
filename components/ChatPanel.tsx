import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, ZoomIn, ZoomOut, Printer, Send } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  senderId: string;
  timestamp: Date;
}

interface ChatPanelProps {
  messages: Message[];
  user: { uid: string } | null;
  onClose: () => void;
  onSendMessage: (text: string) => void;
}

export default function ChatPanel({ messages, user, onClose, onSendMessage }: ChatPanelProps) {
  const [text, setText] = useState('');
  const [fitToPage, setFitToPage] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSendMessage(text);
      setText('');
    }
  };

  const toggleFit = () => {
    setFitToPage(!fitToPage);
  };

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed right-0 top-0 bottom-0 w-full md:w-96 bg-[#0F0A1F] shadow-2xl z-50 flex flex-col border-l border-white/10"
    >
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <h3 className="font-semibold text-lg text-white">Partner Chat</h3>
        <button onClick={onClose} className="p-2 text-white/50 hover:bg-white/10 hover:text-white rounded-full transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Toolbar */}
      <div className="hidden lg:flex items-center justify-between px-4 py-2 border-b border-white/10 bg-white/5">
        <button onClick={toggleFit} className="flex items-center space-x-1 text-sm text-white/60 hover:text-white">
          {fitToPage ? <ZoomOut className="w-4 h-4" /> : <ZoomIn className="w-4 h-4" />}
          <span>{fitToPage ? 'Fit to Page' : 'Full Size'}</span>
        </button>
        <button className="flex items-center space-x-1 text-sm text-white/60 hover:text-white">
          <Printer className="w-4 h-4" />
          <span>Print / PDF</span>
        </button>
      </div>

      {/* Message list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m) => {
          const isMe = m.senderId === user?.uid;
          return (
            <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 ${isMe ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-white/10 text-white rounded-tl-sm'}`}
              >
                <p className="text-sm break-words">{m.text}</p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input form */}
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
            className="absolute right-2 top-2 p-1.5 bg-rose-500 text-white rounded-full disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </motion.div>
  );
}