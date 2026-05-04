import { Chess, Move, Square } from 'chess.js';
import { GameState, Color, Power, INITIAL_POWERS } from '../types/game';

export class SoldierChessGame {
  private chess: Chess;
  private powers: { w: Power[]; b: Power[] };

  constructor(fen?: string) {
    this.chess = new Chess(fen);
    this.powers = JSON.parse(JSON.stringify(INITIAL_POWERS));
  }

  getGameState(): GameState {
    const turn = this.chess.turn() as Color;
    return {
      fen: this.chess.fen(),
      turn,
      selectedSquare: null,
      validMoves: [],
      isCheck: this.chess.isCheck(),
      isCheckmate: this.chess.isCheckmate(),
      isDraw: this.chess.isDraw(),
      winner: this.chess.isCheckmate() ? (turn === 'w' ? 'b' : 'w') : null,
      powers: this.powers,
      lastMove: null,
    };
  }

  getValidMoves(square: Square): Move[] {
    return this.chess.moves({ square, verbose: true }) as Move[];
  }

  makeMove(move: string | { from: string; to: string; promotion?: string }) {
    try {
      const result = this.chess.move(move);
      if (result) {
        this.updateCooldowns();
        return result;
      }
    } catch (e) {
      console.error('Invalid move', e);
    }
    return null;
  }

  usePower(powerId: string, color: Color, targetSquare?: string) {
    const power = this.powers[color].find(p => p.id === powerId);
    if (!power || power.currentCooldown > 0) return false;

    let success = false;
    switch (powerId) {
      case 'teleport':
        success = this.handleTeleport(color, targetSquare!);
        break;
      case 'sniper-beam':
        success = this.handleSniperBeam(color, targetSquare!);
        break;
      case 'heavy-shield':
        success = this.handleShield(color);
        break;
    }

    if (success) {
      power.currentCooldown = power.cooldown;
      this.updateCooldowns(false); // don't double decrement
      return true;
    }
    return false;
  }

  private updateCooldowns(decrement = true) {
    if (decrement) {
      const turn = this.chess.turn() as Color;
      this.powers[turn].forEach(p => {
        if (p.currentCooldown > 0) p.currentCooldown--;
      });
    }
  }

  private handleTeleport(color: Color, target: string): boolean {
    // Arbitrary teleport logic: Knight must exist, target must be empty.
    // In a real game, you'd pick which knight. For simplicity, let's say pick a knight at square X.
    // This is better handled in the UI flow.
    return true; 
  }

  private handleSniperBeam(color: Color, target: string): boolean {
    // Remove piece at target if it's an enemy
    const piece = this.chess.get(target as Square);
    if (piece && piece.color !== color) {
      this.chess.remove(target as Square);
      return true;
    }
    return false;
  }

  private handleShield(color: Color): boolean {
    // This would need state tracking for "invulnerability"
    return true;
  }

  loadFen(fen: string) {
    this.chess.load(fen);
  }

  get board() {
    return this.chess.board();
  }
}
