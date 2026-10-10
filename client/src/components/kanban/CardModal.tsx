import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Trash2, 
  Tag as TagIcon, 
  Clock, 
  AlignLeft, 
  Save, 
  Check
} from 'lucide-react';
import type { CardPriority } from '@/types/board';
import { useBoardStore } from '@/store/useBoardStore';
import { CollaborativeEditor } from '@/components/editor/CollaborativeEditor';
import { CardActivityFeed } from '@/components/kanban/CardActivityFeed';

export const CardModal: React.FC = () => {
  const { selectedCard, setSelectedCard, updateCard, deleteCard } = useBoardStore();

  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<CardPriority>('medium');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (selectedCard) {
      setTitle(selectedCard.title || '');
      setPriority(selectedCard.priority || 'medium');
      setTags(selectedCard.tags || []);
    }
  }, [selectedCard]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedCard(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setSelectedCard]);

  if (!selectedCard) return null;

  const handleSave = async () => {
    await updateCard(selectedCard.id, {
      title,
      priority,
      tags,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (!tags.includes(newTag)) {
        const nextTags = [...tags, newTag];
        setTags(nextTags);
        updateCard(selectedCard.id, { tags: nextTags });
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const nextTags = tags.filter((t) => t !== tagToRemove);
    setTags(nextTags);
    updateCard(selectedCard.id, { tags: nextTags });
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      deleteCard(selectedCard.id);
      setSelectedCard(null);
    }
  };

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
        onClick={() => setSelectedCard(null)}
      >
        {/* Modal Container with Framer Motion spring physics */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          className="relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-2xl sm:rounded-3xl border border-slate-800 bg-slate-950 p-4 sm:p-6 md:p-8 shadow-2xl overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Glow ambient background */}
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Header Row: Priority + Close + Delete */}
          <div className="flex items-center justify-between gap-3 mb-4 sm:mb-5">
            <div className="flex items-center gap-2 sm:gap-3">
              <label className="text-xs font-semibold text-slate-400">Priority:</label>
              <select
                value={priority}
                onChange={(e) => {
                  const nextPriority = e.target.value as CardPriority;
                  setPriority(nextPriority);
                  updateCard(selectedCard.id, { priority: nextPriority });
                }}
                className="px-2.5 sm:px-3 py-1 bg-slate-900 border border-slate-700 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
                <option value="urgent">Urgent Priority</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={handleDelete}
                className="p-1.5 sm:p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all cursor-pointer"
                title="Delete Card"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setSelectedCard(null)}
                className="p-1.5 sm:p-2 text-slate-400 hover:text-white hover:bg-slate-900 rounded-xl transition-all cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Title Input */}
          <div className="mb-4 sm:mb-6">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleSave}
              placeholder="Task Title..."
              className="w-full text-lg sm:text-2xl font-bold bg-transparent text-white border-b border-transparent hover:border-slate-800 focus:border-cyan-500 focus:outline-none py-1 transition-colors"
            />
          </div>

          {/* Description Section */}
          <div className="space-y-3 mb-5 sm:mb-6">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 min-w-0">
                <AlignLeft className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="truncate">
                  Description <span className="hidden sm:inline">(Multiplayer Collaborative Editor)</span>
                </span>
              </div>
              <span className="text-[10px] sm:text-[11px] text-cyan-400/80 font-mono shrink-0">
                Live Sync Enabled
              </span>
            </div>

            <CollaborativeEditor key={selectedCard.id} cardId={selectedCard.id} />
          </div>

          {/* Tags Section */}
          <div className="space-y-3 mb-5 sm:mb-6">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <TagIcon className="w-4 h-4 text-purple-400 shrink-0" />
              <span>Tags & Labels</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300"
                >
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="text-slate-500 hover:text-rose-400 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}

              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="+ Tag (Press Enter)"
                className="px-3 py-1 bg-slate-900/50 border border-dashed border-slate-800 rounded-lg text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Activity Feed & Comments Section */}
          <div className="mb-5 sm:mb-6 pt-4 sm:pt-5 border-t border-slate-800/80">
            <CardActivityFeed key={selectedCard.id} cardId={selectedCard.id} />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 shrink-0" />
              <span>Created {new Date(selectedCard.createdAt).toLocaleDateString()}</span>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-3">
              {saved && (
                <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                  <Check className="w-3.5 h-3.5" />
                  <span>Saved</span>
                </span>
              )}

              <button
                onClick={handleSave}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-all shadow-md shadow-cyan-500/20 active:scale-95 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
