import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, Clock, User as UserIcon } from 'lucide-react';
import { api } from '@/lib/api';
import { getSocket } from '@/lib/socket';
import { useAuthStore } from '@/store/useAuthStore';
import type { CardActivity } from '@/types/board';

interface CardActivityFeedProps {
  cardId: string;
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 10) return 'just now';
  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  return date.toLocaleDateString();
}

export const CardActivityFeed: React.FC<CardActivityFeedProps> = ({ cardId }) => {
  const { user } = useAuthStore();
  const [activities, setActivities] = useState<CardActivity[]>([]);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;

    api
      .get<{ success: boolean; activities: CardActivity[] }>(`/cards/${cardId}/activities`)
      .then((res: { data: { success: boolean; activities: CardActivity[] } }) => {
        if (isMounted && res.data.success) {
          setActivities(res.data.activities || []);
        }
      })
      .catch((err: unknown) => console.error('Error fetching activities:', err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [cardId]);

  // Real-time listener for incoming activities in this card
  useEffect(() => {
    const socket = getSocket();

    const handleNewActivity = (data: { cardId: string; activity: CardActivity }) => {
      if (data.cardId === cardId) {
        setActivities((prev) => {
          if (prev.some((a) => a.id === data.activity.id)) return prev;
          return [...prev, data.activity];
        });
      }
    };

    socket.on('activity-created', handleNewActivity);

    return () => {
      socket.off('activity-created', handleNewActivity);
    };
  }, [cardId]);

  // Scroll to bottom when activities change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activities]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!commentText.trim() || submitting) return;

    const content = commentText.trim();
    setCommentText('');
    setSubmitting(true);

    try {
      const res = await api.post(`/cards/${cardId}/activities`, {
        content,
        type: 'comment',
        userName: user?.name || 'Anonymous Guest',
        userAvatarColor: user?.avatarColor || '#06b6d4',
      });

      if (res.data.success && res.data.activity) {
        setActivities((prev) => {
          if (prev.some((a) => a.id === res.data.activity.id)) return prev;
          return [...prev, res.data.activity];
        });
      }
    } catch (err) {
      console.error('Failed to post comment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
          <MessageSquare className="w-4 h-4 text-pink-400" />
          <span>Activity & Comments</span>
        </div>
        <span className="text-[11px] text-slate-500 font-mono">
          {activities.length} updates
        </span>
      </div>

      {/* Activity List Container */}
      <div
        ref={scrollRef}
        className="max-h-56 overflow-y-auto space-y-2.5 p-3 rounded-2xl bg-slate-900/50 border border-slate-800/80 scrollbar-thin scrollbar-thumb-slate-800"
      >
        {loading ? (
          <div className="py-6 text-center text-xs text-slate-500 font-mono">
            Loading activity stream...
          </div>
        ) : activities.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-500 font-mono flex flex-col items-center gap-1.5">
            <Clock className="w-4 h-4 text-slate-600" />
            <span>No activity yet. Leave the first comment below!</span>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {activities.map((act) => (
              <motion.div
                key={act.id}
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className={`flex items-start gap-2.5 p-2 rounded-xl text-xs transition-colors ${
                  act.type === 'system_log'
                    ? 'bg-slate-950/40 border border-slate-800/40 text-slate-400'
                    : 'bg-slate-950/70 border border-slate-800/70'
                }`}
              >
                {/* User Avatar */}
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-950 shrink-0 shadow-sm ring-1 ring-white/10"
                  style={{ backgroundColor: act.userAvatarColor || '#06b6d4' }}
                >
                  {act.userName ? act.userName.charAt(0).toUpperCase() : <UserIcon className="w-3 h-3" />}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <span className="font-semibold text-slate-200 truncate text-[11px]">
                      {act.userName}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono shrink-0">
                      {formatRelativeTime(act.createdAt)}
                    </span>
                  </div>
                  <p className="text-slate-300 text-[12px] leading-relaxed break-words">
                    {act.content}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Comment Input */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Write a comment... (Press Enter to post)"
            className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-pink-500/80 transition-all shadow-inner"
          />
        </div>
        <button
          type="submit"
          disabled={!commentText.trim() || submitting}
          className="px-3 sm:px-3.5 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-pink-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Send</span>
        </button>
      </form>
    </div>
  );
};
