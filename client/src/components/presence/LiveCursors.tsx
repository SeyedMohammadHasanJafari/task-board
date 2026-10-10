import React from 'react';
import { useSocketStore } from '@/store/useSocketStore';

export const LiveCursors: React.FC = () => {
  const { cursors } = useSocketStore();

  const cursorList = Object.values(cursors);
  if (cursorList.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden">
      {cursorList.map((cursor) => {
        const color = cursor.user.avatarColor || '#06b6d4';
        return (
          <div
            key={cursor.socketId}
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              transform: `translate3d(${cursor.x}px, ${cursor.y}px, 0)`,
              transition: 'transform 60ms linear',
            }}
            className="flex flex-col items-start pointer-events-none"
          >
            {/* Custom Glowing Cursor SVG */}
            <svg
              className="w-5 h-5 -rotate-45 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
              viewBox="0 0 24 24"
              fill={color}
              stroke="#0a0d14"
              strokeWidth="1.5"
            >
              <path d="M3 3l7 18 3-7 7-3L3 3z" />
            </svg>

            {/* Floating Name Badge */}
            <div
              className="ml-3 -mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-slate-950 shadow-lg tracking-wide whitespace-nowrap border border-white/20 select-none animate-fadeIn"
              style={{ backgroundColor: color }}
            >
              {cursor.user.name}
            </div>
          </div>
        );
      })}
    </div>
  );
};
