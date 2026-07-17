'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, Smile, Check, CheckCheck } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { useFirestoreCollection, useFirestoreDocument, addMessage } from '@/lib/firebase';
import { doc, setDoc, orderBy, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { ChatMessage, Couple, UserProfile } from '../global.d';

function getAvatarUrl(name?: string | null, email?: string | null): string {
  const display = (name || email || 'U')?.trim() || 'U';
  const initial = display.charAt(0).toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" fill="#6366f1"/><text x="32" y="38" font-size="28" fill="white" text-anchor="middle" font-family="sans-serif">${initial}</text></svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

function formatMessageDate(value: any): string {
  const date = value instanceof Date ? value : new Date(value);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const oneDay = 24 * 60 * 60 * 1000;
  if (diff < oneDay && date.getDate() === now.getDate()) return 'Today';
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (diff < oneDay * 2 && date.getDate() === yesterday.getDate()) return 'Yesterday';
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
}

function groupMessagesByDate(messages: ChatMessage[]): Map<string, ChatMessage[]> {
  const groups = new Map<string, ChatMessage[]>();
  messages.forEach((m) => {
    const dateLabel = formatMessageDate(m.timestamp);
    const list = groups.get(dateLabel) || [];
    list.push(m);
    groups.set(dateLabel, list);
  });
  return groups;
}

const EMOJI_LIST = ['😀','😂','🥰','😎','🤔','👍','❤️','🔥','✨','🎉','😍','🙌','💯','🥂','🌙','☕'];

export default function ChatDrawer({ coupleId, onClose }: { coupleId: string; onClose: () => void }) {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [partnerProfile, setPartnerProfile] = useState<UserProfile | null>(null);

  const { data: couple } = useFirestoreDocument<Couple>(['couples', coupleId]);
  const partnerId = couple && user ? (couple.user1Id === user.uid ? couple.user2Id : couple.user1Id) : '';

  const { data: partnerDoc } = useFirestoreDocument<UserProfile>(partnerId ? ['users', partnerId] : []);
  useEffect(() => { if (partnerDoc) setPartnerProfile(partnerDoc); }, [partnerDoc]);

  const { data: messages } = useFirestoreCollection<ChatMessage>(
    ['couples', coupleId, 'messages'],
    [orderBy('timestamp', 'asc')],
    (id, data) => ({
      id,
      senderId: data.senderId,
      text: data.text,
      timestamp: new Date((data.timestamp?.toDate?.() ?? data.timestamp ?? Date.now()) as number),
      readBy: Array.isArray(data.readBy) ? data.readBy : [],
    } as ChatMessage)
  );

  const { data: partnerTypingDoc } = useFirestoreDocument<{ isTyping: boolean; updatedAt: number }>(
    partnerId ? ['couples', coupleId, 'typing', partnerId] : []
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (!user || !coupleId) return;
    const typingPath = `couples/${coupleId}/typing/${user.uid}`;
    let timeout: NodeJS.Timeout;
    const updateTyping = async () => {
      try {
        await setDoc(doc(db, typingPath), { isTyping: isTyping, updatedAt: Date.now() }, { merge: true });
      } catch (err) {
        console.error('Typing sync failed', err);
      }
    };
    if (isTyping) {
      updateTyping();
      timeout = setTimeout(() => setIsTyping(false), 3000);
    } else {
      updateTyping();
    }
    return () => clearTimeout(timeout);
  }, [isTyping, user, coupleId]);

  const partnerIsTyping = partnerTypingDoc?.isTyping && (Date.now() - (partnerTypingDoc?.updatedAt || 0)) < 3000;

  const markAsRead = async (messageId: string) => {
    if (!user) return;
    const ref = doc(db, 'couples', coupleId, 'messages', messageId);
    await updateDoc(ref, {
      readBy: Array.from(new Set([...(messages.find(m => m.id === messageId)?.readBy || []), user.uid])),
    }).catch(() => {});
  };

  useEffect(() => {
    if (!user) return;
    messages.forEach((m) => {
      if (m.senderId !== user.uid && !(m.readBy || []).includes(user.uid)) {
        markAsRead(m.id);
      }
    });
  }, [messages, user]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || !user || !coupleId) return;
    try {
      await addMessage(coupleId, { senderId: user.uid, text: trimmed, readBy: [user.uid] });
      setText('');
      setIsTyping(false);
      setShowEmoji(false);
    } catch (err) {
      console.error('Send message failed', err);
    }
  };

  const myAvatar = getAvatarUrl(user?.displayName ?? undefined, user?.email ?? undefined);
  const partnerAvatar = getAvatarUrl(partnerProfile?.displayName ?? undefined, partnerProfile?.email ?? undefined);

  const unreadCount = (messages || []).filter((m) => m.senderId !== user?.uid && !(m.readBy || []).includes(user?.uid || '')).length;

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
    className="h-full w-full bg-slate-950 border-l border-white/10 shadow-2xl flex flex-col overflow-hidden"
    >
      <div className="p-4 border-b border-white/10 flex items-center justify-between pb-3">
        <div>
          <h3 className="font-semibold text-lg text-white">Partner Chat {unreadCount > 0 && <span className="text-xs text-rose-300">({unreadCount})</span>}</h3>
          <p className="text-[11px] text-indigo-300 tracking-wide">Real-time messages</p>
        </div>
        <button onClick={onClose} className="p-2 text-white/50 hover:bg-white/10 hover:text-white rounded-full transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-white/40 text-xs py-10">No messages yet. Say hi ✨</div>
        )}
        {groupMessagesByDate(messages).size === 0 && messages.length === 0 && <div />}
        {Array.from(groupMessagesByDate(messages).entries()).map(([dateLabel, group], groupIdx) => (
          <div key={dateLabel}>
            <div className="text-center text-[10px] text-indigo-200/50 mb-3">{dateLabel}</div>
            <div className="space-y-3">
              <AnimatePresence>
                {group.map((m, idx) => {
                  const isMe = m.senderId === user?.uid;
                  const isLastInGroup = idx === group.length - 1;
                  const isLastFromSender = isLastInGroup || group[idx + 1]?.senderId !== m.senderId;
                  return (
                    <motion.div
                      key={m.id}
                      initial={{ opacity: 0, y: 12, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ type: 'spring', damping: 18, stiffness: 120 }}
                      className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex items-end gap-2 max-w-[85%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                        {isLastFromSender ? (
                          <img src={isMe ? myAvatar : partnerAvatar} alt="avatar" className="w-7 h-7 rounded-full border border-white/10 mb-1 opacity-90" />
                        ) : (
                          <div className="w-7" />
                        )}
                        <div
                          className={`rounded-2xl px-4 py-2.5 shadow-md ${
                            isMe
                              ? 'bg-gradient-to-br from-indigo-600 to-rose-600 text-white rounded-br-none'
                              : 'bg-white/10 text-white rounded-bl-none'
                          }`}
                        >
                          <p className="text-sm break-words leading-relaxed">{m.text}</p>
                          <p className={`mt-1 text-[10px] flex items-center gap-1 ${isMe ? 'text-white/70' : 'text-white/50'}`}>
                            {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            {isMe && ((m.readBy?.length || 0) >= 2 ? <CheckCheck className="w-3 h-3" /> : <Check className="w-3 h-3" />)}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        ))}

        {partnerIsTyping && (
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
            onChange={(e) => { setText(e.target.value); setIsTyping(e.target.value.trim().length > 0); }}
            placeholder="Type a message..."
            className="w-full bg-white/5 text-white border border-white/10 rounded-full py-3 pl-4 pr-24 focus:outline-none focus:ring-2 focus:ring-rose-500 placeholder:text-white/40"
          />
          <div className="absolute right-2 top-2 flex items-center gap-1">
            <button type="button" onClick={() => setShowEmoji(!showEmoji)} className="p-1.5 text-white/60 hover:text-white rounded-full transition-colors">
              <Smile className="w-4 h-4" />
            </button>
            <button type="submit" disabled={!text.trim()} className="p-1.5 bg-rose-500 text-white rounded-full disabled:opacity-50 hover:bg-rose-600 transition-colors">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {showEmoji && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
    className="absolute bottom-20 right-4 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl p-3 grid grid-cols-8 gap-2 z-50"
            >
              {EMOJI_LIST.map((emoji) => (
                <button key={emoji} type="button" onClick={() => { setText((t) => t + emoji); setShowEmoji(false); }} className="text-lg hover:scale-110 transition-transform">
                  {emoji}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </motion.div>
  );
}