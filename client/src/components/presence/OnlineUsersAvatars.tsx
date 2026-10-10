import React from 'react';
import { useSocketStore } from '@/store/useSocketStore';

export const OnlineUsersAvatars: React.FC = () => {
  const { onlineUsers, isConnected } = useSocketStore();

  return (
    <div className="flex items-center gap-2">
      {/* Active Dot & Count */}
      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
        <span
          className={`w-2 h-2 rounded-full ${
            isConnected
              ? 'bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse'
              : 'bg-slate-600'
          }`}
          title={isConnected ? 'Live Socket Connected' : 'Connecting...'}
        />
        <span className="hidden sm:inline">Online:</span>
        <span className="font-bold text-slate-200">{onlineUsers.length}</span>
      </div>

      {/* Overlapping Avatar Circles */}
      <div className="flex items-center -space-x-2 overflow-hidden py-1 px-1">
        {onlineUsers.slice(0, 5).map((user) => (
          <div
            key={user.socketId}
            title={`${user.name} (${user.isGuest ? 'Guest' : 'Member'})`}
            className="relative w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-950 border-2 border-slate-900 shadow-md ring-1 ring-white/10 transition-transform hover:scale-125 hover:z-20 cursor-default"
            style={{ backgroundColor: user.avatarColor || '#06b6d4' }}
          >
            {user.name.charAt(0).toUpperCase()}
          </div>
        ))}

        {onlineUsers.length > 5 && (
          <div className="w-7 h-7 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center text-[10px] font-bold text-slate-300">
            +{onlineUsers.length - 5}
          </div>
        )}
      </div>
    </div>
  );
};
