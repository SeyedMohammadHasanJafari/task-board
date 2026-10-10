import React from 'react';

interface StatusBadgeProps {
  label: string;
  status: 'connected' | 'disconnected' | 'loading';
  detail?: string | number | null;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ label, status, detail }) => {
  const getColors = () => {
    switch (status) {
      case 'connected':
        return {
          bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
          dot: 'bg-emerald-400 animate-pulse',
        };
      case 'disconnected':
        return {
          bg: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
          dot: 'bg-rose-500',
        };
      case 'loading':
      default:
        return {
          bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
          dot: 'bg-amber-400 animate-ping',
        };
    }
  };

  const { bg, dot } = getColors();

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium tracking-wide backdrop-blur-sm transition-all ${bg}`}>
      <span className={`w-2 h-2 rounded-full ${dot}`} />
      <span className="text-slate-300">{label}:</span>
      <span className="font-semibold uppercase tracking-wider">{status}</span>
      {detail !== undefined && detail !== null && (
        <span className="text-slate-400 border-l border-slate-700 pl-2 ml-1">
          {detail}
        </span>
      )}
    </div>
  );
};
