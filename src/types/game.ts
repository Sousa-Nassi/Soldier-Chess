import { Chess, Move } from 'chess.js';

export type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
export type Color = 'w' | 'b';

export interface Power {
  id: string;
  name: string;
  description: string;
  cooldown: number; // in turns
  currentCooldown: number;
}

export interface SoldierPiece {
  type: PieceType;
  color: Color;
  square: string;
  id: string;
}

export interface GameState {
  fen: string;
  turn: Color;
  selectedSquare: string | null;
  validMoves: Move[];
  isCheck: boolean;
  isCheckmate: boolean;
  isDraw: boolean;
  winner: Color | null;
  powers: {
    w: Power[];
    b: Power[];
  };
  lastMove: Move | null;
}

export const INITIAL_POWERS: Record<Color, Power[]> = {
  w: [
    { id: 'teleport', name: 'Spec Ops Teleport', description: 'Move a Knight to any empty square within 2 squares.', cooldown: 5, currentCooldown: 0 },
    { id: 'sniper-beam', name: 'Sniper Beam', description: 'Bishop fires a beam along its diagonal, destroying the first enemy hit.', cooldown: 6, currentCooldown: 0 },
    { id: 'heavy-shield', name: 'Shield Wall', description: 'Pawns become immune to capture for 1 turn.', cooldown: 8, currentCooldown: 0 },
  ],
  b: [
    { id: 'teleport', name: 'Spec Ops Teleport', description: 'Move a Knight to any empty square within 2 squares.', cooldown: 5, currentCooldown: 0 },
    { id: 'sniper-beam', name: 'Sniper Beam', description: 'Bishop fires a beam along its diagonal, destroying the first enemy hit.', cooldown: 6, currentCooldown: 0 },
    { id: 'heavy-shield', name: 'Shield Wall', description: 'Pawns become immune to capture for 1 turn.', cooldown: 8, currentCooldown: 0 },
  ],
};
