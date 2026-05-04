import React, { useState, useEffect } from 'react';
import { useGameRoom } from '../hooks/useGameRoom';
import { auth } from '../lib/firebase';
import { signInWithPopup, GoogleAuthProvider, OAuthProvider, User } from 'firebase/auth';
import ChessBoard from './ChessBoard';
import { Swords, Users, Plus, Play, LogIn, Trophy } from 'lucide-react';
import { cn } from '../lib/utils';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/errorHandler';

export default function GameManager() {
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [availableRooms, setAvailableRooms] = useState<any[]>([]);
  const { createRoom, joinRoom } = useGameRoom();

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => setUser(u));
    return unsub;
  }, []);

  const fetchRooms = async () => {
    try {
      const q = query(collection(db, 'rooms'), where('status', '==', 'waiting'), limit(10));
      const snap = await getDocs(q);
      setAvailableRooms(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'rooms');
    }
  };

  useEffect(() => {
    if (user) fetchRooms();
  }, [user]);

  const handleSignIn = async (providerType: 'google' | 'apple') => {
    let provider;
    if (providerType === 'google') {
      provider = new GoogleAuthProvider();
    } else {
      provider = new OAuthProvider('apple.com');
    }
    await signInWithPopup(auth, provider);
  };

  const handleCreate = async () => {
    const id = await createRoom();
    if (id) setActiveRoomId(id);
  };

  const handleJoin = async (id: string) => {
    await joinRoom(id);
    setActiveRoomId(id);
  };

  if (activeRoomId) {
    return (
      <div className="relative">
        <button 
          onClick={() => setActiveRoomId(null)}
          className="absolute top-[-4.5rem] left-0 text-slate-500 hover:text-white transition-colors text-[10px] uppercase font-black tracking-[0.2em] flex items-center gap-2 group"
        >
          <span className="w-6 h-px bg-slate-500 group-hover:bg-white transition-all group-hover:w-8" />
          Retreat to Lobby
        </button>
        <ChessBoard roomId={activeRoomId} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 animate-in slide-in-from-bottom-4 duration-1000">
      {!user ? (
        <div className="flex flex-col items-center justify-center py-24 frosted-panel border-white/5 shadow-[0_0_100px_rgba(34,211,238,0.05)]">
          <div className="w-24 h-24 bg-cyan-500 rounded-full flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(34,211,238,0.3)] rotate-12">
            <Swords className="w-10 h-10 text-black" />
          </div>
          <h2 className="text-4xl font-black uppercase tracking-tighter mb-3 text-white">Join the Frontline</h2>
          <p className="text-slate-500 mb-10 max-w-sm text-center text-xs leading-relaxed uppercase tracking-wider font-bold">Authenticate your terminal to sync tactical data and deploy globally.</p>
          <div className="flex flex-col gap-3 w-full max-w-xs">
            <button 
              onClick={() => handleSignIn('google')}
              className="flex items-center justify-center gap-4 bg-white text-black px-10 py-5 rounded-full font-black uppercase tracking-widest hover:bg-cyan-400 transition-all active:scale-95 shadow-xl w-full"
            >
              <LogIn className="w-5 h-5" />
              Auth with Google
            </button>
            <button 
              onClick={() => handleSignIn('apple')}
              className="flex items-center justify-center gap-4 bg-black text-white px-10 py-5 rounded-full font-black uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95 border border-white/10 w-full shadow-xl"
            >
              <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
                <span className="text-[12px] text-black pt-0.5"></span>
              </div>
              Auth with Apple
            </button>
          </div>
          <div className="mt-8 pt-8 border-t border-white/5 w-full max-w-sm flex flex-col items-center">
            <p className="text-[9px] text-slate-600 uppercase tracking-[0.2em] text-center leading-relaxed font-black mb-2">
              Account data is synced via social terminal.
            </p>
            <p className="text-[8px] text-cyan-400/50 uppercase tracking-[0.15em] text-center font-bold">
              Automatic Recovery Enabled • Protocol Sec-V4
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* User Profile Summary */}
          <div className="md:col-span-1 space-y-8">
            <div className="frosted-panel p-8 border-white/5 shadow-2xl">
              <div className="flex items-center gap-4 mb-8">
                <div className="relative">
                  <img src={user.photoURL || ''} alt="avatar" className="w-14 h-14 rounded-full border-2 border-cyan-500/50 shadow-[0_0_15px_rgba(34,211,238,0.2)]" />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-black rounded-full" />
                </div>
                <div>
                   <h3 className="font-black text-white truncate w-32 uppercase tracking-tight text-sm">{user.displayName}</h3>
                   <div className="flex items-center gap-2 text-[10px] text-cyan-400 font-black uppercase tracking-widest">
                     <Trophy className="w-3 h-3" /> Division I
                   </div>
                </div>
              </div>
              <div className="space-y-4">
                 <button 
                   onClick={handleCreate}
                   className="w-full flex items-center justify-center gap-3 bg-cyan-500 text-black py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-cyan-400 transition-all shadow-[0_0_30px_rgba(34,211,238,0.2)]"
                 >
                   <Plus className="w-5 h-5" />
                   New Battalion
                 </button>
                 <button 
                    onClick={() => setActiveRoomId('local')}
                    className="w-full py-4 text-slate-500 hover:text-white text-[10px] font-black uppercase tracking-[0.2em] transition-colors border border-white/5 rounded-2xl bg-white/[0.02] hover:bg-white/5"
                 >
                    Training session
                 </button>
              </div>
            </div>

            <div className="frosted-panel p-6 border-white/5 text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 mb-2">Tactical Stats</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xl font-black text-white">42</p>
                  <p className="text-[8px] text-slate-500 uppercase tracking-widest">Wins</p>
                </div>
                <div>
                  <p className="text-xl font-black text-rose-500">12</p>
                  <p className="text-[8px] text-slate-500 uppercase tracking-widest">Losses</p>
                </div>
              </div>
            </div>
          </div>

          {/* Active Missions (Rooms) */}
          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-8">
               <h2 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3 text-white">
                 <Users className="w-6 h-6 text-cyan-400" />
                 Active Deployments
               </h2>
               <button onClick={fetchRooms} className="text-[10px] uppercase font-black tracking-[0.2em] text-cyan-400/50 hover:text-cyan-400 transition-colors bg-cyan-400/5 px-4 py-2 rounded-full border border-cyan-400/10">
                 Refresh Intel
               </button>
            </div>

            <div className="space-y-4">
              {availableRooms.length === 0 ? (
                <div className="p-20 frosted-panel border-white/5 border-dashed flex flex-col items-center justify-center text-slate-700 bg-white/[0.01]">
                  <Play className="w-12 h-12 mb-6 opacity-10" />
                  <p className="text-xs font-black uppercase tracking-[0.2em]">No battalions currently deployed.</p>
                  <p className="text-[10px] uppercase tracking-widest mt-2">Initialize your own command above.</p>
                </div>
              ) : (
                availableRooms.map(r => (
                  <div key={r.id} className="frosted-panel border-white/5 p-6 flex items-center justify-between hover:border-cyan-400/30 transition-all group hover:bg-white/[0.04]">
                    <div className="flex items-center gap-5">
                       <div className="w-12 h-12 bg-white/[0.03] border border-white/5 rounded-2xl flex items-center justify-center text-slate-500 group-hover:text-cyan-400 group-hover:border-cyan-400/30 transition-all">
                         <Swords className="w-6 h-6" />
                       </div>
                       <div>
                         <p className="text-sm font-black text-white uppercase tracking-tight">Commander {r.whiteEmail?.split('@')[0]}</p>
                         <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold mt-1">Awaiting reinforcements...</p>
                       </div>
                    </div>
                    <button 
                      onClick={() => handleJoin(r.id)}
                      className="bg-white/5 hover:bg-cyan-500 hover:text-black text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all border border-white/10 hover:border-cyan-400 shadow-xl"
                    >
                      Enlist
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
