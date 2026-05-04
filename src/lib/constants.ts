import { Chess, Move, Square } from 'chess.js';

export const getPieceName = (type: string) => {
  switch (type.toLowerCase()) {
    case 'p': return 'Soldier';
    case 'n': return 'Spec Ops';
    case 'b': return 'Sniper';
    case 'r': return 'Tank';
    case 'q': return 'General';
    case 'k': return 'Commander';
    default: return 'Unit';
  }
};

export const getPowerForPiece = (type: string) => {
  switch (type.toLowerCase()) {
    case 'n': return 'Teleport';
    case 'b': return 'Sniper Beam';
    case 'p': return 'Shield Wall';
    default: return null;
  }
};
