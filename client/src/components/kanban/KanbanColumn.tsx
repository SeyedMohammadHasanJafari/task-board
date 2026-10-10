import React, { useState } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { Plus, Trash2, X } from 'lucide-react';
import type { Column, Card } from '@/types/board';
import { TaskCard } from './TaskCard';
import { useBoardStore } from '@/store/useBoardStore';

interface KanbanColumnProps {
  column: Column;
  cards: Card[];
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({ column, cards }) => {
  const { createCard, deleteColumn, updateColumn } = useBoardStore();
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [columnTitle, setColumnTitle] = useState(column.title);

  const handleTitleSubmit = async () => {
    setIsEditingTitle(false);
    if (columnTitle.trim() && columnTitle.trim() !== column.title) {
      await updateColumn(column.id, columnTitle.trim());
    } else {
      setColumnTitle(column.title);
    }
  };

  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setIsSubmitting(true);
    try {
      await createCard(column.id, newTitle.trim(), priority);
      setNewTitle('');
      setIsAdding(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteColumn = () => {
    if (window.confirm(`Delete column "${column.title}" and all its ${cards.length} cards?`)) {
      deleteColumn(column.id);
    }
  };

  return (
    <div className="w-[82vw] sm:w-80 shrink-0 flex flex-col max-h-[calc(100vh-11rem)] rounded-2xl border border-slate-800/80 bg-slate-950/70 backdrop-blur-md shadow-xl overflow-hidden transition-colors">
      {/* Column Header */}
      <div className="px-4 py-3.5 border-b border-slate-800/70 flex items-center justify-between gap-2 bg-slate-900/50">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          {isEditingTitle ? (
            <input
              type="text"
              autoFocus
              value={columnTitle}
              onChange={(e) => setColumnTitle(e.target.value)}
              onBlur={handleTitleSubmit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleTitleSubmit();
                if (e.key === 'Escape') {
                  setColumnTitle(column.title);
                  setIsEditingTitle(false);
                }
              }}
              className="w-full text-sm font-bold text-white bg-slate-950 px-2 py-0.5 rounded border border-cyan-500 focus:outline-none"
            />
          ) : (
            <h3 
              onDoubleClick={() => setIsEditingTitle(true)}
              title="Double click to rename column"
              className="text-sm font-bold text-slate-100 tracking-tight truncate hover:text-cyan-300 transition-colors cursor-pointer"
            >
              {column.title}
            </h3>
          )}
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700/60 font-mono shrink-0">
            {cards.length}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsAdding(true)}
            className="p-1 text-slate-400 hover:text-cyan-300 hover:bg-cyan-500/10 rounded-lg transition-colors cursor-pointer"
            title="Add Card"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={handleDeleteColumn}
            className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
            title="Delete Column"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Cards Scroll Container */}
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 p-3 overflow-y-auto min-h-[120px] transition-colors ${
              snapshot.isDraggingOver
                ? 'bg-cyan-950/15 ring-1 ring-inset ring-cyan-500/30'
                : ''
            }`}
          >
            {cards.map((card, index) => (
              <TaskCard key={card.id} card={card} index={index} />
            ))}
            {provided.placeholder}

            {/* Empty State */}
            {cards.length === 0 && !isAdding && (
              <div className="h-28 flex flex-col items-center justify-center text-center p-4 border border-dashed border-slate-800/80 rounded-xl">
                <span className="text-xs text-slate-500 mb-2">No cards in this column</span>
                <button
                  onClick={() => setIsAdding(true)}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer"
                >
                  + Add a task
                </button>
              </div>
            )}
          </div>
        )}
      </Droppable>

      {/* Add Card Form or Action */}
      <div className="p-3 border-t border-slate-800/70 bg-slate-900/40">
        {isAdding ? (
          <form onSubmit={handleAddCard} className="space-y-2.5">
            <textarea
              autoFocus
              required
              rows={2}
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="What needs to be done?..."
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleAddCard(e);
                }
              }}
              className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none"
            />

            <div className="flex items-center justify-between gap-2">
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="bg-slate-950 border border-slate-800 text-[11px] text-slate-300 rounded-lg px-2 py-1 focus:outline-none focus:border-cyan-500"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
                <option value="urgent">Urgent Priority</option>
              </select>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsAdding(false);
                    setNewTitle('');
                  }}
                  className="p-1 text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting || !newTitle.trim()}
                  className="px-3 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'Adding...' : 'Add'}
                </button>
              </div>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="w-full py-2 px-3 rounded-xl border border-dashed border-slate-800 hover:border-cyan-500/50 hover:bg-cyan-500/5 text-slate-400 hover:text-cyan-300 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Card</span>
          </button>
        )}
      </div>
    </div>
  );
};
