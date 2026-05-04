/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import GameManager from './components/GameManager';
import { Shield, Swords, Zap } from 'lucide-react';

export default function App() {
  return (
    <div className="min-h-screen mesh-bg text-white font-sans selection:bg-cyan-500/30">
      {/* Header */}
      <header className="relative z-10 border-b border-white/5 frosted-panel rounded-none !border-t-0 !border-x-0 bg-white/[0.02] backdrop-blur-xl py-4 px-6 mb-8 mx-auto w-full">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="bg-cyan-500 p-2 rounded-lg rotate-12 shadow-[0_0_20px_rgba(34,211,238,0.4)]">
               <Swords className="w-6 h-6 text-black" />
             </div>
             <div>
               <h1 className="text-2xl font-black uppercase tracking-tighter italic">Soldier Chess</h1>
               <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-[0.3em] leading-none">Infinite Conquest</p>
             </div>
          </div>
          
          <nav className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-widest">
            <a href="#" className="hover:text-cyan-400 transition-colors">Tactics</a>
            <a href="#" className="hover:text-cyan-400 transition-colors">Soldiers</a>
            <a href="#" className="hover:text-cyan-400 transition-colors">Multiplayer</a>
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full shadow-inner">
              <Zap className="w-3 h-3 text-cyan-400" />
              <span>Rank: General</span>
            </div>
          </nav>
        </div>
      </header>

      <main className="relative z-10">
        <GameManager />
      </main>

      <footer className="relative z-10 mt-20 border-t border-white/5 py-12 px-6 bg-white/[0.01]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
          <div>
            <h4 className="font-bold uppercase tracking-widest text-sm mb-4 text-cyan-400">Tactical Intelligence</h4>
            <p className="text-slate-500 text-xs leading-relaxed">
              Every soldier counts. Use your tactical powers wisely to turn the tide of battle. Infinite levels mean infinite challenges.
            </p>
          </div>
          <div className="flex flex-col items-center">
             <div className="w-12 h-12 rounded-full border border-white/10 bg-white/[0.03] flex items-center justify-center mb-4 shadow-xl">
               <Shield className="w-6 h-6 text-slate-400" />
             </div>
             <p className="text-[10px] uppercase font-bold text-slate-500">Secured by Firewalls</p>
          </div>
          <div className="text-right">
             <p className="text-xs text-slate-600">© 2026 Soldier Chess: Infinite Conquest</p>
             <p className="text-[10px] text-slate-700 italic border-t border-white/5 pt-2 mt-2">Developed for high-stakes strategic warfare.</p>
             <p className="text-[9px] text-cyan-500/30 uppercase font-black tracking-[0.2em] mt-1">Sousa Nassi Nhauche</p>
          </div>
        </div>
      </footer>

      {/* Persistent Floating Watermark */}
      <div className="fixed bottom-4 right-4 z-[9999] pointer-events-none select-none opacity-20 hover:opacity-40 transition-opacity">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/50 vertical-rl">
          Sousa Nassi Nhauche
        </p>
      </div>
    </div>
  );
}
