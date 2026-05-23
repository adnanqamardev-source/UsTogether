// Inside ChatDrawer.tsx return statement:

    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      // CHANGED: Dark background and border
      className="fixed bottom-6 right-6 w-80 h-96 bg-[#0F0A1F] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50"
    >
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between pb-3">
        <h3 className="font-semibold text-lg text-white">Partner Chat</h3>
        <button onClick={onClose} className="p-2 text-white/50 hover:bg-white/10 hover:text-white rounded-full transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Message list */}
      {/* CHANGED: Removed bg-slate-50 */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-4">
        {messages.map((m) => {
          const isMe = m.senderId === user?.uid;
          return (
            <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div
                // CHANGED: Partner bubble is now translucent dark mode
                className={`max-w-[80%] rounded-2xl px-4 py-2 ${isMe ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white/10 text-white'}`}
              >
                <p className="text-sm break-words">{m.text}</p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <form onSubmit={handleSend} className="p-4 border-t border-white/10">
        <div className="relative">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type a message..."
              // CHANGED: Explicit dark inputs with rose focus rings
              className="w-full bg-white/5 text-white border border-white/10 rounded-full py-3 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-rose-500 placeholder:text-white/40"
            />
            <button
              type="submit"
              disabled={!text.trim()}
              // CHANGED: Button changed to rose-500
              className="absolute right-2 top-2 p-1.5 bg-rose-500 text-white rounded-full disabled:opacity-50 hover:bg-rose-600 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
        </div>
      </form>
    </motion.div>
