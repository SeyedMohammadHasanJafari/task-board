import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { GripVertical, Trash2, Tag } from 'lucide-react';
import type { Card, CardPriority } from '@/types/board';
import { useBoardStore } from '@/store/useBoardStore';

interface TaskCardProps {
  card: Card;
  index: number;
}

export const TaskCard: React.FC<TaskCardProps> = ({ card, index }) => {
  const { setSelectedCard, deleteCard } = useBoardStore();

  const getPriorityStyle = (priority: CardPriority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-rose-500/15 border-rose-500/40 text-rose-300';
      case 'high':
        return 'bg-amber-500/15 border-amber-500/40 text-amber-300';
      case 'medium':
        return 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300';
      case 'low':
      default:
        return 'bg-slate-700/30 border-slate-700 text-slate-400';
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Delete task "${card.title}"?`)) {
      deleteCard(card.id);
    }
  };

  return (
    <Draggable draggableId={card.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          onClick={() => setSelectedCard(card)}
          className={`group relative rounded-xl border bg-slate-900/90 p-3.5 mb-2.5 transition-all duration-200 select-none cursor-pointer backdrop-blur-sm ${
            snapshot.isDragging
              ? 'border-cyan-400 bg-slate-850 shadow-2xl shadow-cyan-500/20 scale-[1.02] rotate-1 z-50 ring-1 ring-cyan-400'
              : 'border-slate-800/80 hover:border-slate-700 hover:bg-slate-900 shadow-md'
          }`}
        >
          {/* Header Row: Drag Handle + Priority Badge + Delete */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-1.5">
              <div
                {...provided.dragHandleProps}
                className="p-0.5 text-slate-600 hover:text-slate-300 cursor-grab active:cursor-grabbing transition-colors"
                title="Drag task"
              >
                <GripVertical className="w-3.5 h-3.5" />
              </div>

              <span
                className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${getPriorityStyle(
                  card.priority
                )}`}
              >
                {card.priority}
              </span>
            </div>

            <button
              onClick={handleDelete}
              className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-all cursor-pointer"
              title="Delete card"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card Title */}
          <h4 className="text-sm font-semibold text-slate-100 group-hover:text-cyan-200 transition-colors line-clamp-2 mb-2 leading-snug">
            {card.title}
          </h4>

          {/* Description Snippet (up to 15 words) */}
          {card.description && typeof card.description === 'string' && card.description.trim() && (() => {
            const words = card.description.trim().split(/\s+/);
            const snippet = words.slice(0, 15).join(' ') + (words.length > 15 ? '...' : '');
            return (
              <p className="text-xs text-slate-400/90 line-clamp-2 mb-3 leading-relaxed break-words">
                {snippet}
              </p>
            );
          })()}

          {/* Tags Footer */}
          {card.tags && card.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-800/60">
              {card.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-400 bg-slate-950/60 px-2 py-0.5 rounded-md border border-slate-800"
                >
                  <Tag className="w-2.5 h-2.5 text-cyan-500/70" />
                  <span>{tag}</span>
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
};
