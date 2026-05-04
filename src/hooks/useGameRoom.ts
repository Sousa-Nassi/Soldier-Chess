import { useState, useEffect } from 'react';
import { 
  doc, 
  onSnapshot, 
  setDoc, 
  updateDoc, 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs,
  Timestamp 
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { GameState, Color } from '../types/game';
import { handleFirestoreError, OperationType } from '../lib/errorHandler';

interface GameRoom {
  id: string;
  fen: string;
  whitePlayer: string;
  blackPlayer: string | null;
  status: 'waiting' | 'active' | 'finished';
  turn: Color;
  lastMoveAt: Timestamp;
}

export function useGameRoom(roomId?: string) {
  const [room, setRoom] = useState<GameRoom | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!roomId) {
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(doc(db, 'rooms', roomId), (doc) => {
      if (doc.exists()) {
        setRoom({ id: doc.id, ...doc.data() } as GameRoom);
        setError(null);
      } else {
        setError('Room not found');
      }
      setLoading(false);
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, `rooms/${roomId}`);
    });

    return () => unsubscribe();
  }, [roomId]);

  const updateGame = async (fen: string, turn: Color) => {
    if (!roomId) return;
    try {
      await updateDoc(doc(db, 'rooms', roomId), {
        fen,
        turn,
        lastMoveAt: Timestamp.now()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `rooms/${roomId}`);
    }
  };

  const createRoom = async () => {
    const user = auth.currentUser;
    if (!user) return null;

    try {
      const docRef = await addDoc(collection(db, 'rooms'), {
        fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        whitePlayer: user.uid,
        whiteEmail: user.email,
        blackPlayer: null,
        status: 'waiting',
        turn: 'w',
        createdAt: Timestamp.now(),
        lastMoveAt: Timestamp.now()
      });
      return docRef.id;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'rooms');
    }
  };

  const joinRoom = async (id: string) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      await updateDoc(doc(db, 'rooms', id), {
        blackPlayer: user.uid,
        blackEmail: user.email,
        status: 'active'
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `rooms/${id}`);
    }
  };

  return { room, loading, error, updateGame, createRoom, joinRoom };
}
