import React, { useEffect, useRef, useCallback, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { DragDropContext, type DropResult } from '@hello-pangea/dnd';
import { useBoardStore } from '@/store/useBoardStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useSocketStore } from '@/store/useSocketStore';
import { getSocket } from '@/lib/socket';
import { BoardHeader } from '@/components/kanban/BoardHeader';
import { BoardSidebar } from '@/components/layout/BoardSidebar';
import { KanbanColumn } from '@/components/kanban/KanbanColumn';
import { CardModal } from '@/components/kanban/CardModal';
import { LiveCursors } from '@/components/presence/LiveCursors';
import { AlertCircle, Plus, Loader2, Search, X } from 'lucide-react';

export const BoardPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const { 
    currentBoard, 
    cards, 
    isLoading, 
    error, 
    fetchBoard, 
    optimisticMoveCard, 
    createColumn,
    clearError,
    handleRemoteCardMove,
    handleRemoteCardCreate,
    handleRemoteCardUpdate,
    handleRemoteCardDelete,
    handleRemoteColumnUpdate,
  } = useBoardStore();

  const { 
    setConnected, 
    setOnlineUsers, 
    updateCursor, 
    removeCursor, 
    clearRoomData 
  } = useSocketStore();

  const lastCursorEmitRef = useRef<number>(0);
  const [searchQuery, setSearchQuery] = useState('');

  // Filtered cards based on search query (title and tags)
  const filteredCards = useMemo(() => {
    if (!searchQuery.trim()) return cards;
    const q = searchQuery.toLowerCase();
    return cards.filter(
      (card) =>
        card.title.toLowerCase().includes(q) ||
        card.tags?.some((t) => t.toLowerCase().includes(q))
    );
  }, [cards, searchQuery]);

  useEffect(() => {
    fetchBoard(id || 'demo');
  }, [id, fetchBoard]);

  useEffect(() => {
    const boardId = currentBoard?.id;
    if (!boardId) return;

    const socket = getSocket();

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    if (socket.connected) {
      setConnected(true);
    }

    // Join Board Room with user identity
    socket.emit('join-board', {
      boardId,
      user: {
        userId: user?.id,
        name: user?.name || 'Anonymous Guest',
        avatarColor: user?.avatarColor || '#06b6d4',
        isGuest: !!user?.isGuest,
      },
    });

    // Presence Listeners
    socket.on('presence-update', (users) => {
      setOnlineUsers(users);
    });

    socket.on('cursor-update', (cursorData) => {
      updateCursor(cursorData);
    });

    socket.on('cursor-removed', ({ socketId }) => {
      removeCursor(socketId);
    });

    // Real-Time Board Action Listeners
    socket.on('card-moved', (data) => {
      handleRemoteCardMove(data);
    });

    socket.on('card-created', (card) => {
      handleRemoteCardCreate(card);
    });

    socket.on('card-updated', (card) => {
      handleRemoteCardUpdate(card);
    });

    socket.on('card-deleted', ({ cardId }) => {
      handleRemoteCardDelete(cardId);
    });

    socket.on('column-updated', (columns) => {
      handleRemoteColumnUpdate(columns);
    });

    return () => {
      socket.emit('leave-board', { boardId });
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('presence-update');
      socket.off('cursor-update');
      socket.off('cursor-removed');
      socket.off('card-moved');
      socket.off('card-created');
      socket.off('card-updated');
      socket.off('card-deleted');
      socket.off('column-updated');
      clearRoomData();
    };
  }, [
    currentBoard?.id,
    user?.id,
    user?.name,
    user?.avatarColor,
    user?.isGuest,
    setConnected,
    setOnlineUsers,
    updateCursor,
    removeCursor,
    clearRoomData,
    handleRemoteCardMove,
    handleRemoteCardCreate,
    handleRemoteCardUpdate,
    handleRemoteCardDelete,
    handleRemoteColumnUpdate,
  ]);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!currentBoard) return;
      const now = performance.now();
      if (now - lastCursorEmitRef.current < 50) return;

      lastCursorEmitRef.current = now;
      const socket = getSocket();

      socket.emit('cursor-move', {
        boardId: currentBoard.id,
        x: e.clientX,
        y: e.clientY,
        user: {
          userId: user?.id,
          name: user?.name || 'Anonymous Guest',
          avatarColor: user?.avatarColor || '#06b6d4',
        },
      });
    },
    [currentBoard, user]
  );

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    optimisticMoveCard(
      draggableId,
      source.droppableId,
      destination.droppableId,
      source.index,
      destination.index
    );
  };

  if (isLoading && !currentBoard) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
        <span className="text-xs text-slate-400 font-mono tracking-wider">
          Loading Kanban Workspace...
        </span>
      </div>
    );
  }

  if (error && !currentBoard) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-4">
        <div className="max-w-md p-6 rounded-2xl border border-rose-500/30 bg-rose-500/10 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
          <h2 className="text-lg font-bold text-white">Board Loading Error</h2>
          <p className="text-xs text-rose-300">{error}</p>
          <button
            onClick={() => fetchBoard(id || 'demo')}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold border border-slate-700 cursor-pointer"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!currentBoard) return null;

  const sortedColumns = [...currentBoard.columns].sort((a, b) => a.order - b.order);

  return (
    <div 
      onPointerMove={handlePointerMove}
      className="min-h-[calc(100vh-4rem)] flex flex-row bg-[#0a0d14] overflow-hidden relative"
    >
      {/* Real-Time Live Remote Cursors Overlay */}
      <LiveCursors />

      {/* Collapsible Workspace Sidebar */}
      <BoardSidebar />

      {/* Main Board Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Board Header with Presence Indicators */}
        <BoardHeader board={currentBoard} />

        {/* Error Toast Notification if sync error occurs */}
        {error && (
          <div className="mx-6 mt-3 flex items-center justify-between p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
            <span>{error}</span>
            <button
              onClick={clearError}
              className="text-slate-400 hover:text-white text-xs underline cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

      {/* Search & Filter Bar */}
      <div className="px-3 sm:px-6 pt-3 pb-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter tasks by title or tags..."
            className="w-full pl-9 pr-8 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {searchQuery && (
          <span className="text-[11px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20 self-start sm:self-auto">
            Showing {filteredCards.length} of {cards.length} tasks
          </span>
        )}
      </div>

      {/* Drag and Drop Canvas */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex-1 p-3 sm:p-6 overflow-x-auto flex items-start gap-3 sm:gap-5 pb-6 sm:pb-8">
          {sortedColumns.map((column) => {
            const columnCards = filteredCards
              .filter((card) => card.columnId === column.id)
              .sort((a, b) => a.order - b.order);

            return (
              <KanbanColumn
                key={column.id}
                column={column}
                cards={columnCards}
              />
            );
          })}

          {/* Quick Add Column Card */}
          <div className="w-[82vw] sm:w-72 shrink-0 p-4 rounded-2xl border border-dashed border-slate-800/80 bg-slate-900/20 hover:border-slate-700 transition-colors flex flex-col items-center justify-center text-center">
            <span className="text-xs text-slate-500 mb-2">Need another stage?</span>
            <button
              onClick={() => {
                const title = prompt('Enter new column title:');
                if (title && title.trim()) createColumn(title.trim());
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-cyan-400" />
              <span>Add Column</span>
            </button>
          </div>
        </div>
      </DragDropContext>
      </div>

      {/* Card Detail & Editing Modal */}
      <CardModal />
    </div>
  );
};
