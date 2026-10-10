import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  Layout, 
  Plus, 
  Kanban, 
  Sparkles, 
  LayoutDashboard,
  Trash2,
  X
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAppStore } from '@/store/useAppStore';
import type { Board } from '@/types/board';

export const BoardSidebar: React.FC = () => {
  const navigate = useNavigate();
  const { id: currentBoardId } = useParams<{ id: string }>();
  const { isSidebarOpen, setSidebarOpen, toggleSidebar } = useAppStore();
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth >= 768) {
      localStorage.setItem('sidebar_open', String(isSidebarOpen));
    }
  }, [isSidebarOpen]);

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
        console.error('Failed to fetch sidebar boards:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [currentBoardId]);

  const handleNavClick = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  const handleCreateBoard = async () => {
    const title = prompt('Enter new board title:');
    if (!title || !title.trim()) return;

    try {
      const res = await api.post<{ success: boolean; board: Board }>('/boards', {
        title: title.trim(),
      });
      if (res.data.success && res.data.board) {
        setBoards((prev) => [res.data.board, ...prev]);
        handleNavClick();
        navigate(`/board/${res.data.board.id}`);
      }
    } catch (err: unknown) {
      console.error('Failed to create board:', err);
      alert('Failed to create board');
    }
  };

  const handleDeleteBoard = async (e: React.MouseEvent, boardId: string, boardTitle: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete board "${boardTitle}" and all its tasks?`)) {
      return;
    }

    try {
      await api.delete(`/boards/${boardId}`);
      setBoards((prev) => prev.filter((b) => b.id !== boardId));
      if (currentBoardId === boardId) {
        handleNavClick();
        navigate('/dashboard');
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to delete board');
    }
  };

  // Reusable inner content for both desktop in-flow and mobile off-canvas drawer
  const renderSidebarContent = (isMobile: boolean, isExpanded: boolean) => (
    <>
      {/* Sidebar Header with Toggle & Mobile Close */}
      <div className="h-12 px-3 border-b border-slate-800/60 flex items-center justify-between gap-2">
        {isExpanded ? (
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300 truncate">
            <Kanban className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="truncate">Workspaces</span>
          </div>
        ) : (
          <div className="mx-auto">
            <Kanban className="w-4 h-4 text-cyan-400" />
          </div>
        )}

        <div className="flex items-center gap-1">
          {isMobile ? (
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors cursor-pointer"
              title="Close sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={toggleSidebar}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors cursor-pointer"
              title={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              {isExpanded ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Navigation Quick Links */}
      <div className="p-2 space-y-1 border-b border-slate-800/40">
        <Link
          to="/dashboard"
          onClick={handleNavClick}
          className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-900/80 transition-colors"
          title="Dashboard"
        >
          <LayoutDashboard className="w-4 h-4 text-slate-400 shrink-0" />
          {isExpanded && <span>All Boards</span>}
        </Link>
      </div>

      {/* Boards List Section */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin scrollbar-thumb-slate-800">
        {isExpanded && (
          <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Active Boards
          </div>
        )}

        {/* Demo Board Link */}
        <Link
          to="/board/demo"
          onClick={handleNavClick}
          className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium transition-all ${
            currentBoardId === 'demo'
              ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
          }`}
          title="Demo Workspace"
        >
          <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
          {isExpanded && <span className="truncate font-semibold">Demo Board</span>}
        </Link>

        {/* Custom Boards */}
        {boards
          .filter((b) => b.id !== 'demo')
          .map((board) => {
            const isActive = currentBoardId === board.id;
            return (
              <div
                key={board.id}
                className="group flex items-center justify-between"
              >
                <Link
                  to={`/board/${board.id}`}
                  onClick={handleNavClick}
                  className={`flex-1 min-w-0 flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                  }`}
                  title={board.title}
                >
                  <Layout className="w-4 h-4 text-slate-500 shrink-0" />
                  {isExpanded && <span className="truncate">{board.title}</span>}
                </Link>

                {isExpanded && (
                  <button
                    onClick={(e) => handleDeleteBoard(e, board.id, board.title)}
                    className="opacity-70 sm:opacity-0 group-hover:opacity-100 p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all ml-1 cursor-pointer"
                    title="Delete board"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}

        {loading && isExpanded && (
          <div className="px-2 py-2 text-[11px] text-slate-600 font-mono">
            Loading boards...
          </div>
        )}
      </div>

      {/* Sidebar Footer with Add Board Action */}
      <div className="p-2 border-t border-slate-800/60 bg-slate-950/40">
        <button
          onClick={handleCreateBoard}
          className={`w-full py-2 rounded-xl border border-dashed border-slate-800 hover:border-cyan-500/50 hover:bg-cyan-500/5 text-slate-400 hover:text-cyan-300 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            !isExpanded ? 'px-0' : 'px-3'
          }`}
          title="Create New Board"
        >
          <Plus className="w-4 h-4 shrink-0" />
          {isExpanded && <span>New Board</span>}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* 1. Mobile Smooth Animated Drawer with AnimatePresence */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            {/* Backdrop with Fade */}
            <motion.div
              key="mobile-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 top-16 bg-black/75 backdrop-blur-xs z-40 md:hidden"
              aria-hidden="true"
            />

            {/* Off-canvas Drawer with Spring Slide */}
            <motion.aside
              key="mobile-drawer"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed inset-y-0 left-0 top-16 z-50 w-72 bg-slate-950/95 border-r border-slate-800 shadow-2xl backdrop-blur-xl flex flex-col md:hidden select-none"
            >
              {renderSidebarContent(true, true)}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* 2. Desktop In-flow Sidebar */}
      <aside
        className={`hidden md:flex h-[calc(100vh-4rem)] border-r border-slate-800/80 bg-slate-950/70 backdrop-blur-md flex-col transition-all duration-300 select-none z-30 shrink-0 ${
          isSidebarOpen ? 'w-60' : 'w-14'
        }`}
      >
        {renderSidebarContent(false, isSidebarOpen)}
      </aside>
    </>
  );
};
