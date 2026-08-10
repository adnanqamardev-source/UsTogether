"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { X, Send } from "lucide-react";
import { useAuth } from "./AuthProvider";
import { useIsMobile } from "@/hooks/use-mobile";
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { handleFirestoreError, OperationType } from "@/lib/firestore-errors";

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
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  // Autoscroll when messages change.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!coupleId) return;
    const q = query(collection(db, "couples", coupleId, "messages"), orderBy("timestamp"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setMessages(
          snap.docs.map((d) => ({
            id: d.id,
            text: d.data().text,
            senderId: d.data().senderId,
            timestamp: d.data().timestamp?.toDate?.() || new Date(),
          }))
        );
      },
      (err) => handleFirestoreError(err, OperationType.LIST, `couples/${coupleId}/messages`, user)
    );
    return () => unsub();
  }, [coupleId, user]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !user) return;
    try {
      await addDoc(collection(db, "couples", coupleId, "messages"), {
        text: text.trim(),
        senderId: user.uid,
        timestamp: serverTimestamp(),
      });
      setText("");
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `couples/${coupleId}/messages`, user);
    }
  };

  return (
    <>
      {/* Backdrop scrim */}
      <div className="fixed inset-0 bg-black/60 z-40" onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 16 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className={`fixed bottom-0 right-0 top-0 sm:bottom-6 sm:right-6 sm:top-auto ${
          isMobile
            ? "w-full h-[calc(100%-5rem)] sm:w-96 sm:h-[28rem] rounded-t-xl sm:rounded-xl"
            : "w-96 h-[28rem] rounded-xl"
        } bg-canvas border border-hairline shadow-[0_12px_40px_rgba(0,0,0,0.12)] flex flex-col overflow-hidden z-50`}
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-hairline flex items-center justify-between">
          <h3 className="font-medium">Partner chat</h3>
          <button
            onClick={onClose}
            className="p-1.5 text-ink/50 hover:bg-surface-soft hover:text-ink rounded-full transition-colors"
            aria-label="Close chat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {messages.map((m) => {
            const isMe = m.senderId === user?.uid;
            return (
              <div key={m.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-lg px-3 py-2 text-sm break-words ${
                    isMe
                      ? "bg-ink text-canvas rounded-br-none"
                      : "bg-surface-soft text-ink rounded-bl-none"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="p-3 border-t border-hairline">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type a message…"
              className="flex-1 bg-canvas text-ink rounded-md px-3 py-2 border border-hairline placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-ink transition-shadow"
            />
            <button
              type="submit"
              disabled={!text.trim()}
              className="shrink-0 p-2 bg-ink text-canvas rounded-full disabled:opacity-40 hover:bg-ink/85 transition-colors"
              aria-label="Send"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </motion.div>
    </>
  );
}