import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Share2, 
  Check, 
  Plus, 
  CheckCircle2, 
  RefreshCw,
  PanelLeft
} from 'lucide-react';
import type { Board } from '@/types/board';
import { useBoardStore } from '@/store/useBoardStore';
import { useAppStore } from '@/store/useAppStore';
import { OnlineUsersAvatars } from '@/components/presence/OnlineUsersAvatars';

interface BoardHeaderProps {
  board: Board;
}

export const BoardHeader: React.FC<BoardHeaderProps> = ({ board }) => {
  const { isSyncing, createColumn } = useBoardStore();
  const { toggleSidebar } = useAppStore();
  const [copied, setCopied] = useState(false);
  const [isAddingCol, setIsAddingCol] = useState(false);
  const [newColTitle, setNewColTitle] = useState('');

  const guestLink = `${window.location.origin}/board/${board.id}?guest=true`;

  const handleCopyGuestLink = () => {
    navigator.clipboard.writeText(guestLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleAddColumn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColTitle.trim()) return;
    await createColumn(newColTitle.trim());
    setNewColTitle('');
    setIsAddingCol(false);
  };

  return (
    <div className="border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md px-3 sm:px-6 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
      {/* Left: Sidebar Toggle + Back Link + Board Title */}
      <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-900/60 text-slate-400 hover:text-white transition-all cursor-pointer shrink-0"
          title="Toggle Workspaces Sidebar"
        >
          <PanelLeft className="w-4 h-4 text-cyan-400" />
        </button>

        <Link
          to="/dashboard"
          className="p-2 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-900/60 text-slate-400 hover:text-white transition-all cursor-pointer shrink-0"
          title="Back to Dashboard"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-xl font-extrabold tracking-tight text-white truncate max-w-[180px] sm:max-w-sm md:max-w-md">
              {board.title}
            </h1>
            <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shrink-0">
              Live
            </span>
          </div>
          <p className="text-[11px] text-slate-400 truncate hidden sm:block">
            Drag cards between columns • Optimistic updates enabled
          </p>
        </div>
      </div>

      {/* Right: Online Avatars + Sync Status + Guest Share + Add Column */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Active Collaborators Presence */}
        <OnlineUsersAvatars />

        {/* Real-Time Sync Indicator */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900/60 text-xs font-mono">
          {isSyncing ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
              <span className="text-cyan-300">Syncing...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Synced</span>
            </>
          )}
        </div>

        {/* Share Guest Link Button */}
        <button
          onClick={handleCopyGuestLink}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-purple-500/40 bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 text-xs font-semibold shadow-lg shadow-purple-500/10 transition-all active:scale-95 cursor-pointer"
          title="Share guest access link"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4 text-purple-400" />}
          <span>{copied ? 'Link Copied!' : 'Guest Link'}</span>
        </button>

        {/* Add Column inline */}
        {isAddingCol ? (
          <form onSubmit={handleAddColumn} className="flex items-center gap-2">
            <input
              type="text"
              autoFocus
              required
              value={newColTitle}
              onChange={(e) => setNewColTitle(e.target.value)}
              placeholder="Column name..."
              className="px-3 py-1.5 bg-slate-900 border border-cyan-500 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none w-36"
            />
            <button
              type="submit"
              className="px-3 py-1.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition-all cursor-pointer"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAddingCol(false);
                setNewColTitle('');
              }}
              className="text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              Cancel
            </button>
          </form>
        ) : (
          <button
            onClick={() => setIsAddingCol(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-cyan-400" />
            <span>New Column</span>
          </button>
        )}
      </div>
    </div>
  );
};
