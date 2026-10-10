import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Kanban, 
  Sparkles, 
  Copy, 
  Check, 
  Plus, 
  Share2, 
  Clock, 
  ArrowUpRight,
  Shield,
  LogOut,
  Trash2,
  FolderPlus,
  Layers,
  X
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { api } from '@/lib/api';
import type { Board } from '@/types/board';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [copied, setCopied] = useState(false);
  const [boards, setBoards] = useState<Board[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [creatingLoading, setCreatingLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const guestLink = `${window.location.origin}/login?guest=true`;

  const copyGuestLink = () => {
    navigator.clipboard.writeText(guestLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    let isMounted = true;

    api
      .get<{ success: boolean; boards: Board[] }>('/boards')
      .then((res) => {
        if (isMounted && res.data.success) {
          setBoards(res.data.boards || []);
        }
      })
      .catch((err: unknown) => {
        console.error('Failed to fetch user boards:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Handle board creation
  const handleCreateBoard = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newBoardTitle.trim()) return;

    setCreatingLoading(true);
    setError(null);

    try {
      const res = await api.post<{ success: boolean; board: Board }>('/boards', {
        title: newBoardTitle.trim(),
      });

      if (res.data.success && res.data.board) {
        const createdBoard = res.data.board;
        setBoards((prev) => [createdBoard, ...prev]);
        setNewBoardTitle('');
        setIsCreating(false);
        navigate(`/board/${createdBoard.id}`);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create board');
    } finally {
      setCreatingLoading(false);
    }
  };

  // Handle board deletion
  const handleDeleteBoard = async (e: React.MouseEvent, boardId: string, boardTitle: string) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete board "${boardTitle}" and all its tasks?`)) {
      return;
    }

    try {
      await api.delete(`/boards/${boardId}`);
      setBoards((prev) => prev.filter((b) => b.id !== boardId));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to delete board');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] p-3.5 sm:p-6 lg:p-10 max-w-7xl mx-auto space-y-6 sm:space-y-8">
      {/* User Welcome & Overview Card */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900/90 via-slate-950/80 to-slate-950 p-4 sm:p-8 backdrop-blur-xl shadow-2xl">
        <div 
          className="absolute -top-20 -left-20 w-60 h-60 rounded-full blur-3xl opacity-20 pointer-events-none" 
          style={{ backgroundColor: user?.avatarColor || '#06b6d4' }}
        />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5 sm:gap-6">
          <div className="flex items-center gap-3.5 sm:gap-5 min-w-0">
            {/* Avatar Circle */}
            <div 
              className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center font-bold text-xl sm:text-2xl text-slate-950 shadow-xl ring-2 sm:ring-4 ring-slate-800/80 shrink-0"
              style={{ backgroundColor: user?.avatarColor || '#06b6d4' }}
            >
              {user?.name?.charAt(0).toUpperCase()}
            </div>

            <div className="space-y-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-white tracking-tight truncate max-w-[200px] sm:max-w-none">
                  Welcome, {user?.name}
                </h1>
                <span 
                  className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-widest px-2 sm:px-2.5 py-0.5 rounded-full border shrink-0 ${
                    user?.isGuest
                      ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  }`}
                >
                  {user?.isGuest ? 'Guest Session' : 'Registered Member'}
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate">
                {user?.isGuest ? 'Temporary demo session with real-time participation rights' : user?.email}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            <button
              onClick={copyGuestLink}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-xs font-semibold transition-all shadow-lg shadow-cyan-500/10 active:scale-95 cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Link Copied!' : 'Copy Guest Link'}</span>
            </button>

            <button
              onClick={handleLogout}
              className="inline-flex items-center justify-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl border border-slate-800 hover:border-rose-500/50 hover:bg-rose-500/10 text-slate-400 hover:text-rose-300 text-xs font-semibold transition-all active:scale-95 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Guest Mode Banner Info (if guest) */}
      {user?.isGuest && (
        <div className="rounded-2xl border border-purple-500/30 bg-purple-950/20 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-purple-200">You are in Demo Guest Mode</h3>
              <p className="text-xs text-purple-300/70">
                You can move cards, collaborate, and broadcast live cursors without registration.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/register')}
            className="text-xs font-semibold px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white transition-all shadow-md active:scale-95 cursor-pointer shrink-0"
          >
            Convert to Permanent Account
          </button>
        </div>
      )}

      {/* Boards Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Your Workspaces & Boards</h2>
            <p className="text-xs text-slate-400">Select a board to start organizing or collaborating</p>
          </div>
          <button
            onClick={() => setIsCreating(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-semibold shadow-lg shadow-cyan-500/20 transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Board</span>
          </button>
        </div>

        {/* Modal for creating a new board */}
        {isCreating && (
          <div className="p-4 rounded-2xl border border-cyan-500/40 bg-slate-900/90 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                <FolderPlus className="w-4 h-4 text-cyan-400" />
                <span>Create New Board Workspace</span>
              </h3>
              <button 
                onClick={() => setIsCreating(false)} 
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateBoard} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <input
                type="text"
                autoFocus
                required
                value={newBoardTitle}
                onChange={(e) => setNewBoardTitle(e.target.value)}
                placeholder="Enter board title (e.g., Marketing Q4, Sprint 24)..."
                className="flex-1 px-4 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  disabled={creatingLoading || !newBoardTitle.trim()}
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all disabled:opacity-50 cursor-pointer shadow-md shadow-cyan-500/20"
                >
                  {creatingLoading ? 'Creating...' : 'Create Workspace'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-3 py-2 rounded-xl text-slate-400 hover:text-white text-xs cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
            {error && <p className="text-xs text-rose-400">{error}</p>}
          </div>
        )}

        {/* Boards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* User's custom boards */}
          {boards.map((board) => (
            <div
              key={board.id}
              onClick={() => navigate(`/board/${board.id}`)}
              className="group relative rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900/90 via-slate-900/50 to-slate-950 p-6 shadow-xl hover:border-cyan-500/50 transition-all duration-300 cursor-pointer active:scale-[0.99] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                    <Kanban className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                      {board.columns?.length || 4} Columns
                    </span>
                    <button
                      onClick={(e) => handleDeleteBoard(e, board.id, board.title)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title="Delete Board"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-bold text-white mb-1.5 group-hover:text-cyan-300 transition-colors truncate">
                  {board.title}
                </h3>
                <p className="text-xs text-slate-400 mb-5 line-clamp-2 leading-relaxed">
                  Real-time collaborative Kanban board with live cursors, drag & drop, and CRDT rich text editor.
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>{new Date(board.createdAt).toLocaleDateString()}</span>
                </div>
                <span className="flex items-center gap-1 text-cyan-400 font-semibold group-hover:translate-x-0.5 transition-transform">
                  <span>Open Board</span>
                  <ArrowUpRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          ))}

          {/* Empty state if user has no boards yet */}
          {!isLoading && boards.length === 0 && (
            <div className="col-span-full p-8 rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">No Custom Workspaces Yet</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                  You haven't created any boards yet. Create your first project board to start organizing tasks, or explore the shared demo board!
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setIsCreating(true)}
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-cyan-500/20 cursor-pointer"
                >
                  + Create Your First Board
                </button>
                <button
                  onClick={() => navigate('/board/demo')}
                  className="px-4 py-2 rounded-xl border border-slate-700 hover:border-slate-600 bg-slate-900 text-slate-300 text-xs font-semibold transition-all cursor-pointer"
                >
                  Explore Demo Board
                </button>
              </div>
            </div>
          )}

          {/* Persistent Shared Demo Board Card for Easy Testing */}
          <div 
            onClick={() => navigate('/board/demo')}
            className="group relative rounded-2xl border border-purple-500/30 bg-gradient-to-br from-slate-900/90 via-slate-900/50 to-slate-950 p-6 shadow-xl hover:border-purple-400 transition-all duration-300 cursor-pointer active:scale-[0.99]"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/30">
                Shared Playground
              </span>
            </div>

            <h3 className="text-base font-bold text-white mb-1.5 group-hover:text-purple-300 transition-colors">
              Product Sprint 2026 (Demo Board)
            </h3>
            <p className="text-xs text-slate-400 mb-5 leading-relaxed">
              Shared multiplayer sandbox with sample cards, live cursors, and concurrent CRDT editing.
            </p>

            <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>Multiplayer Ready</span>
              </div>
              <span className="flex items-center gap-1 text-purple-400 font-semibold group-hover:translate-x-0.5 transition-transform">
                <span>Open Sandbox</span>
                <ArrowUpRight className="w-4 h-4" />
              </span>
            </div>
          </div>

          {/* Instant Guest Share Feature Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Share2 className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30">
                Collaboration Link
              </span>
            </div>

            <h3 className="text-base font-bold text-white mb-1.5">
              Instant Guest Link Sharing
            </h3>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Share this guest link with another browser window or incognito tab to test live presence and real-time interaction.
            </p>

            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-between gap-2">
              <span className="font-mono text-[11px] text-slate-400 truncate">
                {guestLink}
              </span>
              <button
                onClick={copyGuestLink}
                className="shrink-0 p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Copy Link"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Architecture Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Shield className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Secure Session
              </span>
            </div>

            <h3 className="text-base font-bold text-white mb-1.5">
              JWT Authenticated
            </h3>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Session is signed via Bearer JWT with HMAC SHA-256 and protected against CSRF and credential theft.
            </p>

            <div className="space-y-1.5 text-xs text-slate-400">
              <div className="flex justify-between">
                <span>User ID:</span>
                <span className="font-mono text-slate-300">{user?.id?.slice(-8)}</span>
              </div>
              <div className="flex justify-between">
                <span>Color Code:</span>
                <span className="font-mono" style={{ color: user?.avatarColor }}>{user?.avatarColor}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
