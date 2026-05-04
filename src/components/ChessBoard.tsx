import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SoldierChessGame } from '../lib/chessGame';
import { GameState, Color } from '../types/game';
import { Square } from 'chess.js';
import { getPieceName, getPowerForPiece } from '../lib/constants';
import { Shield, Zap, Target, Swords, User, Trophy } from 'lucide-react';
import { cn } from '../lib/utils';
import { useGameRoom } from '../hooks/useGameRoom';
import Chat from './Chat';

export default function ChessBoard({ roomId }: { roomId?: string }) {
  const [game, setGame] = useState<SoldierChessGame>(new SoldierChessGame());
  const [state, setState] = useState<GameState>(game.getGameState());
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [validMoves, setValidMoves] = useState<Square[]>([]);
  const [powerActive, setPowerActive] = useState<string | null>(null);

  const { room, updateGame } = useGameRoom(roomId === 'local' ? undefined : roomId);

  useEffect(() => {
    if (room && room.status === 'active') {
      if (room.fen !== game.getGameState().fen) {
        game.loadFen(room.fen);
        updateState();
      }
    }
  }, [room]);

  const updateState = () => {
    const newState = game.getGameState();
    setState(newState);
    if (roomId && roomId !== 'local') {
      updateGame(newState.fen, newState.turn);
    }
  };

  const handleSquareClick = (square: Square) => {
    if (powerActive) {
      const success = game.usePower(powerActive, state.turn, square);
      if (success) {
        setPowerActive(null);
        updateState();
      }
      return;
    }

    if (selectedSquare === square) {
      setSelectedSquare(null);
      setValidMoves([]);
      return;
    }

    const piece = game.board.flat().find(p => p && p.square === square);
    
    if (piece && piece.color === state.turn) {
      setSelectedSquare(square);
      const moves = game.getValidMoves(square);
      setValidMoves(moves.map(m => m.to as Square));
    } else if (selectedSquare && validMoves.includes(square)) {
      game.makeMove({ from: selectedSquare, to: square, promotion: 'q' });
      setSelectedSquare(null);
      setValidMoves([]);
      updateState();
    } else {
      setSelectedSquare(null);
      setValidMoves([]);
    }
  };

  const renderSquare = (square: Square, rowIndex: number, colIndex: number) => {
    const isDark = (rowIndex + colIndex) % 2 === 1;
    const piece = game.board[rowIndex][colIndex];
    const isSelected = selectedSquare === square;
    const isValid = validMoves.includes(square);

    return (
      <div
        key={square}
        id={`square-${square}`}
        onClick={() => handleSquareClick(square)}
        className={cn(
          "relative flex items-center justify-center w-full aspect-square cursor-pointer transition-all duration-200",
          isDark ? "square-dark" : "square-light",
          isSelected && "active-glow z-10 scale-[1.02]",
          isValid && "after:content-[''] after:absolute after:w-3 after:h-3 after:bg-cyan-400 after:rounded-full after:shadow-[0_0_10px_rgba(34,211,238,0.8)]"
        )}
      >
        <AnimatePresence>
          {piece && (
            <motion.div
              layoutId={piece.type + piece.color + rowIndex + colIndex}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className={cn(
                "w-[80%] h-[80%] flex items-center justify-center rounded-xl shadow-lg border border-white/10 backdrop-blur-sm",
                piece.color === 'w' ? "bg-white/10 text-cyan-100" : "bg-rose-950/40 text-rose-100 border-rose-500/30"
              )}
            >
              <div className="flex flex-col items-center">
                <span className="text-[8px] font-bold uppercase tracking-widest opacity-60 mb-0.5">
                  {getPieceName(piece.type)}
                </span>
                <span className="text-2xl filter drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">
                  {renderPieceIcon(piece.type)}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Row/Col labels */}
        {colIndex === 0 && <span className="absolute top-0.5 left-1 text-[8px] opacity-20 font-mono">{8 - rowIndex}</span>}
        {rowIndex === 7 && <span className="absolute bottom-0.5 right-1 text-[8px] opacity-20 font-mono">{String.fromCharCode(97 + colIndex)}</span>}
      </div>
    );
  };

  const renderPieceIcon = (type: string) => {
    switch (type) {
      case 'p': return '💂';
      case 'n': return '🐎';
      case 'b': return '🎯';
      case 'r': return '🛡️';
      case 'q': return '🎖️';
      case 'k': return '👑';
      default: return '';
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-2 md:p-4 max-w-6xl mx-auto items-start animate-in fade-in duration-700">
      {/* Game Board */}
      <div className="flex-1 w-full max-w-[600px] lg:max-w-none frosted-panel p-3 md:p-6 shadow-[0_0_50px_rgba(0,0,0,0.5)] mx-auto">
        <div className="flex justify-between w-full items-end border-b border-white/10 pb-3 mb-4 md:mb-6">
          <div className="text-xl md:text-2xl font-light text-white tracking-[0.2em] uppercase">
            Tactical <span className="font-bold text-cyan-400">Grid</span>
          </div>
          <div className="text-sm md:text-lg font-mono text-cyan-400 bg-black/40 px-3 md:px-4 py-1 rounded-full border border-white/5">
            08:42
          </div>
        </div>
        <div className="grid grid-cols-8 grid-rows-8 w-full border-2 md:border-4 border-white/10 overflow-hidden rounded-xl shadow-2xl touch-none">
          {Array.from({ length: 8 }).map((_, rowIndex) =>
            Array.from({ length: 8 }).map((_, colIndex) => {
              const square = (String.fromCharCode(97 + colIndex) + (8 - rowIndex)) as Square;
              return renderSquare(square, rowIndex, colIndex);
            })
          )}
        </div>
      </div>

      {/* Sidebar Info */}
      <div className="w-full lg:w-80 flex flex-col gap-6">
        {/* Status Card */}
        <div className="frosted-panel p-5 md:p-6 border-white/5">
          <div className="flex items-center gap-3 mb-4 md:mb-6">
            <div className={cn("w-3 h-3 rounded-full animate-pulse shadow-[0_0_10px_currentColor]", state.turn === 'w' ? "text-cyan-400 bg-cyan-400" : "text-rose-500 bg-rose-500")} />
            <h2 className="text-base md:text-lg font-bold text-white uppercase tracking-wider">
              {state.turn === 'w' ? "Commander Alpha" : "Strike Team Red"}
            </h2>
          </div>
          
          <div className="flex justify-between items-center bg-white/[0.03] border border-white/5 p-3 md:p-4 rounded-2xl mb-4">
            <div className="flex items-center gap-2">
              <Swords className="text-slate-400 w-4 h-4" />
              <span className="text-slate-400 text-[9px] md:text-[10px] uppercase font-bold tracking-widest">Status</span>
            </div>
            <span className={cn("font-mono text-xs md:text-sm", state.isCheckmate ? "text-rose-500" : "text-cyan-400")}>
              {state.isCheckmate ? "TERMINATED" : state.isCheck ? "UNDER FIRE" : "ENGAGED"}
            </span>
          </div>

          {state.winner && (
            <div className="bg-cyan-500/10 border border-cyan-500/50 p-4 rounded-2xl text-cyan-400 flex items-center gap-3 shadow-lg">
              <Trophy className="w-6 h-6" />
              <div>
                <p className="font-bold text-xs uppercase tracking-widest">Victory Achieved</p>
                <p className="text-[10px] opacity-70">{state.winner === 'w' ? "White" : "Red"} Forces dominant.</p>
              </div>
            </div>
          )}
        </div>

        {/* Powers Card */}
        <div className="frosted-panel p-6 border-white/5">
          <h3 className="text-[11px] font-black uppercase text-white/50 tracking-[0.2em] mb-4 flex items-center gap-2">
            <Zap className="text-cyan-400 w-4 h-4" />
            Tactical Buffs
          </h3>
          <div className="space-y-3">
            {state.powers[state.turn].map(power => (
              <button
                key={power.id}
                onClick={() => setPowerActive(power.id === powerActive ? null : power.id)}
                disabled={power.currentCooldown > 0}
                className={cn(
                  "w-full p-4 rounded-2xl border transition-all text-left group relative overflow-hidden",
                  power.currentCooldown > 0 
                  ? "bg-white/[0.01] border-white/5 opacity-50 cursor-not-allowed" 
                  : powerActive === power.id
                  ? "bg-cyan-500/10 border-cyan-500/50 text-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.1)]"
                  : "bg-white/[0.03] border-white/10 hover:border-white/30 text-slate-300"
                )}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold text-[11px] tracking-widest uppercase">{power.name}</span>
                  {power.currentCooldown > 0 ? (
                    <span className="text-[9px] font-mono bg-white/5 px-2 py-0.5 rounded-full border border-white/10">{power.currentCooldown}T</span>
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
                  )}
                </div>
                <p className="text-[10px] leading-relaxed opacity-50 group-hover:opacity-100 transition-opacity">
                  {power.description}
                </p>
                {powerActive === power.id && (
                  <motion.div 
                    layoutId="power-active-bg"
                    className="absolute inset-0 bg-cyan-500/5 -z-10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  />
                )}
              </button>
            ))}
          </div>
          {powerActive && (
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="mt-4 p-3 bg-cyan-500/5 border border-cyan-500/20 rounded-2xl"
            >
              <p className="text-cyan-400 text-[9px] font-black text-center uppercase tracking-[0.3em]">
                Acquiring Target...
              </p>
            </motion.div>
          )}
        </div>

        {/* Levels / XP Mockup */}
        <div className="frosted-panel p-6 border-white/5">
          <div className="flex items-center justify-between mb-3 text-[10px] font-black uppercase tracking-widest text-slate-500">
             <span className="flex items-center gap-1.5">
               <Trophy className="w-3 h-3 text-cyan-400" /> Rank 14
             </span>
             <span>320 XP REMAINING</span>
          </div>
          <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden border border-white/5 p-px">
            <div className="bg-cyan-500 h-full w-[65%] rounded-full shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
          </div>
        </div>

        {/* Chat Panel */}
        {roomId && roomId !== 'local' && (
          <Chat roomId={roomId} />
        )}
      </div>
    </div>
  );
}
