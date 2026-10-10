import { create } from 'zustand';
import { api } from '@/lib/api';
import { getSocket } from '@/lib/socket';
import type { Board, Card, Column, BoardDetailsResponse, CardPriority } from '@/types/board';

interface BoardState {
  currentBoard: Board | null;
  cards: Card[];
  selectedCard: Card | null;
  isLoading: boolean;
  isSyncing: boolean;
  error: string | null;

  setSelectedCard: (card: Card | null) => void;
  clearError: () => void;

  fetchBoard: (boardId: string) => Promise<void>;
  createCard: (columnId: string, title: string, priority?: CardPriority, tags?: string[]) => Promise<Card>;
  updateCard: (cardId: string, data: Partial<Card>) => Promise<void>;
  deleteCard: (cardId: string) => Promise<void>;

  optimisticMoveCard: (
    cardId: string,
    sourceColId: string,
    destColId: string,
    sourceIndex: number,
    destIndex: number
  ) => Promise<void>;

  createColumn: (title: string) => Promise<void>;
  updateColumn: (columnId: string, title: string) => Promise<void>;
  deleteColumn: (columnId: string) => Promise<void>;

  // Remote Real-Time Socket Event Handlers
  handleRemoteCardMove: (data: {
    cardId: string;
    sourceColumn: string;
    destColumn: string;
    newOrder: number;
    siblingIds?: string[];
  }) => void;
  handleRemoteCardCreate: (card: Card) => void;
  handleRemoteCardUpdate: (card: Card) => void;
  handleRemoteCardDelete: (cardId: string) => void;
  handleRemoteColumnUpdate: (columns: Column[]) => void;
}

export const useBoardStore = create<BoardState>((set, get) => ({
  currentBoard: null,
  cards: [],
  selectedCard: null,
  isLoading: false,
  isSyncing: false,
  error: null,

  setSelectedCard: (card) => set({ selectedCard: card }),
  clearError: () => set({ error: null }),

  fetchBoard: async (boardId: string) => {
    set({ isLoading: true, error: null });
    try {
      const endpoint = boardId === 'demo' ? '/boards/demo' : `/boards/${boardId}`;
      const res = await api.get<BoardDetailsResponse>(endpoint);
      set({
        currentBoard: res.data.board,
        cards: res.data.cards,
        isLoading: false,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load board';
      set({ isLoading: false, error: msg });
    }
  },

  createCard: async (columnId, title, priority = 'medium', tags = []) => {
    const { currentBoard, cards } = get();
    if (!currentBoard) throw new Error('No active board');

    const colCards = cards.filter((c) => c.columnId === columnId);
    const order = colCards.length;

    const tempId = `temp-${Date.now()}`;
    const optimisticCard: Card = {
      id: tempId,
      boardId: currentBoard.id,
      columnId,
      title,
      description: '',
      order,
      priority,
      tags,
      createdAt: new Date().toISOString(),
    };

    set({ cards: [...cards, optimisticCard] });

    try {
      const res = await api.post<{ success: boolean; card: Card }>(
        `/boards/${currentBoard.id}/cards`,
        { columnId, title, priority, tags, order }
      );
      const realCard = res.data.card;

      set((state) => ({
        cards: state.cards.map((c) => (c.id === tempId ? realCard : c)),
      }));

      // Broadcast to other users on the board
      const socket = getSocket();
      socket.emit('card-created', {
        boardId: currentBoard.id,
        card: realCard,
      });

      return realCard;
    } catch (err: unknown) {
      set((state) => ({
        cards: state.cards.filter((c) => c.id !== tempId),
        error: err instanceof Error ? err.message : 'Failed to create card',
      }));
      throw err;
    }
  },

  updateCard: async (cardId, data) => {
    const { currentBoard, cards, selectedCard } = get();
    const previousCards = [...cards];

    const updatedCard = {
      ...(cards.find((c) => c.id === cardId) || {}),
      ...data,
    } as Card;

    set({
      cards: cards.map((c) => (c.id === cardId ? { ...c, ...data } : c)),
      selectedCard:
        selectedCard?.id === cardId ? { ...selectedCard, ...data } : selectedCard,
    });

    try {
      await api.put(`/cards/${cardId}`, data);

      if (currentBoard) {
        getSocket().emit('card-updated', {
          boardId: currentBoard.id,
          card: updatedCard,
        });
      }
    } catch (err: unknown) {
      set({
        cards: previousCards,
        error: err instanceof Error ? err.message : 'Failed to update card',
      });
    }
  },

  deleteCard: async (cardId) => {
    const { currentBoard, cards, selectedCard } = get();
    const previousCards = [...cards];

    set({
      cards: cards.filter((c) => c.id !== cardId),
      selectedCard: selectedCard?.id === cardId ? null : selectedCard,
    });

    try {
      await api.delete(`/cards/${cardId}`);

      if (currentBoard) {
        getSocket().emit('card-deleted', {
          boardId: currentBoard.id,
          cardId,
        });
      }
    } catch (err: unknown) {
      set({
        cards: previousCards,
        error: err instanceof Error ? err.message : 'Failed to delete card',
      });
    }
  },

  optimisticMoveCard: async (
    cardId: string,
    sourceColId: string,
    destColId: string,
    sourceIndex: number,
    destIndex: number
  ) => {
    const { currentBoard, cards } = get();
    const previousCards = [...cards];

    const sourceColCards = cards
      .filter((c) => c.columnId === sourceColId)
      .sort((a, b) => a.order - b.order);

    const destColCards =
      sourceColId === destColId
        ? sourceColCards
        : cards
            .filter((c) => c.columnId === destColId)
            .sort((a, b) => a.order - b.order);

    const movingCard = cards.find((c) => c.id === cardId);
    if (!movingCard) return;

    if (sourceColId === destColId) {
      const reordered = Array.from(sourceColCards);
      const [removed] = reordered.splice(sourceIndex, 1);
      reordered.splice(destIndex, 0, removed);

      const updatedColumnCards = reordered.map((c, idx) => ({
        ...c,
        order: idx,
      }));

      const newCards = cards.map((c) => {
        if (c.columnId === sourceColId) {
          const match = updatedColumnCards.find((u) => u.id === c.id);
          return match || c;
        }
        return c;
      });

      set({ cards: newCards, isSyncing: true });

      // Broadcast move event immediately over WebSocket
      if (currentBoard) {
        getSocket().emit('card-move', {
          boardId: currentBoard.id,
          cardId,
          sourceColumn: sourceColId,
          destColumn: destColId,
          newOrder: destIndex,
          siblingIds: updatedColumnCards.map((c) => c.id),
        });
      }

      try {
        await api.put(`/cards/${cardId}/move`, {
          columnId: destColId,
          order: destIndex,
          siblingIds: updatedColumnCards.map((c) => c.id),
        });
      } catch (err: unknown) {
        set({
          cards: previousCards,
          error: err instanceof Error ? err.message : 'Move sync failed',
        });
      } finally {
        set({ isSyncing: false });
      }
    } else {
      const newSourceCards = Array.from(sourceColCards);
      newSourceCards.splice(sourceIndex, 1);

      const newDestCards = Array.from(destColCards);
      newDestCards.splice(destIndex, 0, {
        ...movingCard,
        columnId: destColId,
      });

      const updatedSource = newSourceCards.map((c, idx) => ({ ...c, order: idx }));
      const updatedDest = newDestCards.map((c, idx) => ({ ...c, columnId: destColId, order: idx }));

      const newCards = cards.map((c) => {
        if (c.id === cardId) {
          return { ...c, columnId: destColId, order: destIndex };
        }
        if (c.columnId === sourceColId) {
          const match = updatedSource.find((u) => u.id === c.id);
          return match || c;
        }
        if (c.columnId === destColId) {
          const match = updatedDest.find((u) => u.id === c.id);
          return match || c;
        }
        return c;
      });

      set({ cards: newCards, isSyncing: true });

      // Broadcast move event immediately over WebSocket
      if (currentBoard) {
        getSocket().emit('card-move', {
          boardId: currentBoard.id,
          cardId,
          sourceColumn: sourceColId,
          destColumn: destColId,
          newOrder: destIndex,
          siblingIds: updatedDest.map((c) => c.id),
        });
      }

      try {
        await api.put(`/cards/${cardId}/move`, {
          columnId: destColId,
          order: destIndex,
          siblingIds: updatedDest.map((c) => c.id),
        });
      } catch (err: unknown) {
        set({
          cards: previousCards,
          error: err instanceof Error ? err.message : 'Move sync failed',
        });
      } finally {
        set({ isSyncing: false });
      }
    }
  },

  createColumn: async (title: string) => {
    const { currentBoard } = get();
    if (!currentBoard) return;

    try {
      const res = await api.post<{ success: boolean; column: Column; board: Board }>(
        `/boards/${currentBoard.id}/columns`,
        { title }
      );
      set({ currentBoard: res.data.board });

      getSocket().emit('column-update', {
        boardId: currentBoard.id,
        columns: res.data.board.columns,
      });
    } catch (err: unknown) {
      set({ error: err instanceof Error ? err.message : 'Failed to create column' });
    }
  },

  updateColumn: async (columnId: string, title: string) => {
    const { currentBoard } = get();
    if (!currentBoard) return;

    try {
      const res = await api.put<{ success: boolean; board: Board }>(
        `/boards/${currentBoard.id}/columns/${columnId}`,
        { title }
      );
      set({ currentBoard: res.data.board });

      getSocket().emit('column-update', {
        boardId: currentBoard.id,
        columns: res.data.board.columns,
      });
    } catch (err: unknown) {
      set({ error: err instanceof Error ? err.message : 'Failed to update column' });
    }
  },

  deleteColumn: async (columnId: string) => {
    const { currentBoard, cards } = get();
    if (!currentBoard) return;

    try {
      const res = await api.delete<{ success: boolean; board: Board }>(
        `/boards/${currentBoard.id}/columns/${columnId}`
      );
      set({
        currentBoard: res.data.board,
        cards: cards.filter((c) => c.columnId !== columnId),
      });

      getSocket().emit('column-update', {
        boardId: currentBoard.id,
        columns: res.data.board.columns,
      });
    } catch (err: unknown) {
      set({ error: err instanceof Error ? err.message : 'Failed to delete column' });
    }
  },

  // Handlers for incoming remote WebSocket events
  handleRemoteCardMove: (data) => {
    const { cards } = get();
    const movingCard = cards.find((c) => c.id === data.cardId);
    if (!movingCard) return;

    const updated = cards.map((c) => {
      if (c.id === data.cardId) {
        return { ...c, columnId: data.destColumn, order: data.newOrder };
      }
      return c;
    });

    set({ cards: updated });
  },

  handleRemoteCardCreate: (card) => {
    const { cards } = get();
    if (cards.some((c) => c.id === card.id)) return;
    set({ cards: [...cards, card] });
  },

  handleRemoteCardUpdate: (card) => {
    const { cards, selectedCard } = get();
    set({
      cards: cards.map((c) => (c.id === card.id ? card : c)),
      selectedCard: selectedCard?.id === card.id ? card : selectedCard,
    });
  },

  handleRemoteCardDelete: (cardId) => {
    const { cards, selectedCard } = get();
    set({
      cards: cards.filter((c) => c.id !== cardId),
      selectedCard: selectedCard?.id === cardId ? null : selectedCard,
    });
  },

  handleRemoteColumnUpdate: (columns) => {
    const { currentBoard } = get();
    if (!currentBoard) return;
    set({
      currentBoard: {
        ...currentBoard,
        columns,
      },
    });
  },
}));
