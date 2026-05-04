import React, { useState, useEffect, useRef } from 'react';
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  Timestamp,
  limit 
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Send, User, Mic, MicOff } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { handleFirestoreError, OperationType } from '../lib/errorHandler';

interface Message {
  id: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: any;
}

export default function Chat({ roomId }: { roomId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isMicOn, setIsMicOn] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query(
      collection(db, 'rooms', roomId, 'messages'),
      orderBy('createdAt', 'asc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];
      setMessages(msgs);
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, `rooms/${roomId}/messages`);
    });

    return () => unsubscribe();
  }, [roomId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !auth.currentUser) return;

    try {
      await addDoc(collection(db, 'rooms', roomId, 'messages'), {
        userId: auth.currentUser.uid,
        userName: auth.currentUser.displayName || 'Soldier',
        text: input.trim(),
        createdAt: Timestamp.now()
      });
      setInput('');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `rooms/${roomId}/messages`);
    }
  };

  const toggleMic = async () => {
    if (!isMicOn) {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        setIsMicOn(true);
      } catch (err) {
        alert("Microphone access denied. Check browser permissions.");
      }
    } else {
      setIsMicOn(false);
    }
  };

  return (
    <div className="flex flex-col h-[400px] w-full frosted-panel border-white/5 overflow-hidden">
      <div className="p-3 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400">Tactical Comms</h3>
        <button 
          onClick={toggleMic}
          className={cn(
            "p-1.5 rounded-full transition-all",
            isMicOn ? "bg-cyan-500 text-black shadow-[0_0_15px_rgba(34,211,238,0.5)]" : "bg-white/5 text-slate-500 hover:text-white"
          )}
        >
          {isMicOn ? <Mic className="w-3.5 h-3.5 animate-pulse" /> : <MicOff className="w-3.5 h-3.5" />}
        </button>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-none bg-black/20"
      >
        <AnimatePresence initial={false}>
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, x: m.userId === auth.currentUser?.uid ? 10 : -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={cn(
                "flex flex-col max-w-[80%]",
                m.userId === auth.currentUser?.uid ? "ml-auto items-end" : "mr-auto items-start"
              )}
            >
              <span className="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-1">
                {m.userName}
              </span>
              <div className={cn(
                "px-3 py-2 rounded-2xl text-xs leading-relaxed",
                m.userId === auth.currentUser?.uid 
                  ? "bg-cyan-500/10 text-cyan-100 border border-cyan-500/20 rounded-tr-none" 
                  : "bg-white/5 text-slate-300 border border-white/10 rounded-tl-none"
              )}>
                {m.text}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <form onSubmit={handleSend} className="p-3 bg-white/[0.02] border-t border-white/5 flex gap-2">
        <input 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type intel..."
          className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-cyan-500/50 transition-all"
        />
        <button 
          type="submit"
          disabled={!input.trim()}
          className="p-2 bg-cyan-500 text-black rounded-xl hover:bg-cyan-400 disabled:opacity-50 disabled:hover:bg-cyan-500 transition-all shadow-lg"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
