import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Sparkles, 
  ArrowRight, 
  Kanban, 
  Users, 
  MousePointer, 
  Share2, 
  FileText, 
  Zap, 
  CheckCircle2, 
  XCircle,
  LayoutDashboard,
  Layers,
  Flame,
  Star,
  Compass
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loginAsGuest, isLoading: isAuthLoading } = useAuthStore();

  const handleGuestQuickLaunch = async () => {
    try {
      await loginAsGuest();
      navigate('/dashboard');
    } catch {
      // Handled in store
    }
  };

  const features = [
    {
      icon: <Kanban className="w-6 h-6 text-cyan-400" />,
      title: 'Multiplayer Kanban Boards',
      description: 'Organize tasks with intuitive drag-and-drop mechanics. Enjoy sub-second optimistic UI reactivity while every card move is instantly broadcast across all active screens.',
      tag: 'Real-Time Sync',
      badgeColor: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300'
    },
    {
      icon: <FileText className="w-6 h-6 text-purple-400" />,
      title: 'Conflict-Free Collaborative Docs',
      description: 'Powered by TipTap and Yjs CRDTs. Multiple team members can write specs and task descriptions simultaneously without overwrite collisions or merge locks.',
      tag: 'CRDT Powered',
      badgeColor: 'border-purple-500/30 bg-purple-500/10 text-purple-300'
    },
    {
      icon: <Share2 className="w-6 h-6 text-pink-400" />,
      title: 'Frictionless 1-Click Guest Mode',
      description: 'Invite clients, contractors, or guest reviewers in one second. Anyone with your shared guest link participates instantly with live presence and zero registration friction.',
      tag: 'Zero Friction',
      badgeColor: 'border-pink-500/30 bg-pink-500/10 text-pink-300'
    },
    {
      icon: <MousePointer className="w-6 h-6 text-emerald-400" />,
      title: 'Live Remote Cursors & Presence',
      description: 'Feel true multiplayer spatial awareness. Watch teammate cursors glide across the board in real-time at 50ms intervals, paired with live online avatar stacks.',
      tag: 'Sub-50ms',
      badgeColor: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
    },
    {
      icon: <Users className="w-6 h-6 text-blue-400" />,
      title: 'Card Activity Streams & Comments',
      description: 'Keep all project context right inside the task. Real-time comment threads and audit events keep distributed squads aligned without endless meetings.',
      tag: 'Team Sync',
      badgeColor: 'border-blue-500/30 bg-blue-500/10 text-blue-300'
    },
    {
      icon: <Zap className="w-6 h-6 text-amber-400" />,
      title: 'Lightweight & Blazing Performance',
      description: 'Built on a high-throughput MERN and WebSocket architecture. Designed with a sleek cyber dark aesthetic, minimal memory footprint, and instant page transitions.',
      tag: 'High Velocity',
      badgeColor: 'border-amber-500/30 bg-amber-500/10 text-amber-300'
    }
  ];

  const steps = [
    {
      number: '01',
      title: 'Create or Launch a Workspace',
      description: 'Create your private workspace in seconds or try the instant demo playground with zero initial setup required.'
    },
    {
      number: '02',
      title: 'Share Your Live Link',
      description: 'Invite your engineering team, stakeholders, or clients via permanent member links or frictionless 1-click guest access.'
    },
    {
      number: '03',
      title: 'Co-Create & Ship Fast',
      description: 'Move cards seamlessly, co-edit specs with live typing presence, and watch everyone stay in sync without refreshing.'
    }
  ];

  const comparison = [
    {
      feature: 'Simultaneous Card Description Editing',
      taskflow: 'True Yjs CRDTs (Zero overwrite conflicts)',
      others: 'File locks, overwrite risks, or static text'
    },
    {
      feature: 'Guest & Reviewer Onboarding',
      taskflow: '1-Click Instant Guest Access (No password barrier)',
      others: 'Mandatory sign-up, email verification & friction'
    },
    {
      feature: 'Real-Time Remote Cursors',
      taskflow: 'Live 50ms throttled multiplayer cursor tracking',
      others: 'No spatial awareness or requires external tools'
    },
    {
      feature: 'Board Updates & Card Movements',
      taskflow: 'Sub-second optimistic UI + WebSocket broadcast',
      others: 'Manual page refresh or polling lag'
    },
    {
      feature: 'Visual Aesthetics & Modern UI',
      taskflow: 'Sleek Cyber Dark UI with glowing micro-interactions',
      others: 'Cluttered enterprise dashboards & sterile interfaces'
    }
  ];

  const testimonials = [
    {
      quote: 'The instant guest link is a game changer for client reviews. We demoed a full sprint board to stakeholders without asking them to create an account.',
      author: 'Elena Rostova',
      role: 'Head of Engineering at TechVanguard',
      avatarColor: '#06b6d4'
    },
    {
      quote: 'Collaborative TipTap editing inside task cards feels as natural as Google Docs. Two engineers were writing acceptance criteria together in real-time with zero conflicts.',
      author: 'Marcus Vance',
      role: 'Staff Product Architect',
      avatarColor: '#8b5cf6'
    },
    {
      quote: 'Super snappy drag-and-drop and live cursors. The UI is gorgeous and our team adopted it on day one without any training.',
      author: 'Sophia Chen',
      role: 'Lead UI/UX Designer',
      avatarColor: '#ec4899'
    }
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] pb-16 space-y-16 sm:space-y-24">
      {/* 1. Hero Section */}
      <section className="relative pt-6 sm:pt-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
        {/* Ambient Glowing Blobs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 sm:w-[650px] h-96 sm:h-[650px] bg-gradient-to-tr from-cyan-500/15 via-indigo-500/10 to-purple-600/15 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="text-center space-y-6 max-w-4xl mx-auto">
          {/* Top Pill Announcement */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 shadow-lg shadow-cyan-500/5 backdrop-blur-md">
            <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-xs font-semibold text-slate-200">
              Next-Gen Multiplayer Task Management
            </span>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
            Where High-Performing Teams Ship Projects{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
              in Real-Time
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-slate-300 text-sm sm:text-lg max-w-2xl mx-auto leading-relaxed">
            The modern collaborative workspace that combines fluid optimistic drag-and-drop Kanban, live remote cursor tracking, conflict-free CRDT docs, and frictionless 1-click guest access.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
            {isAuthenticated ? (
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link
                  to="/board/demo"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-xl shadow-cyan-500/25 transition-all active:scale-95 cursor-pointer"
                >
                  <Kanban className="w-4 h-4" />
                  <span>Open Live Kanban Board</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl border border-slate-700 hover:border-slate-600 bg-slate-900/80 hover:bg-slate-800 text-slate-200 font-semibold text-sm transition-all active:scale-95"
                >
                  <LayoutDashboard className="w-4 h-4 text-cyan-400" />
                  <span>Go to Dashboard</span>
                </Link>
              </div>
            ) : (
              <>
                <button
                  onClick={handleGuestQuickLaunch}
                  disabled={isAuthLoading}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-purple-600/25 transition-all active:scale-95 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-purple-200 animate-pulse" />
                  <span>Try Demo as Guest (Instant Access)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl border border-slate-700 hover:border-slate-600 bg-slate-900/80 hover:bg-slate-800 text-slate-200 font-semibold text-sm transition-all active:scale-95"
                >
                  <span>Create Free Account</span>
                </Link>
              </>
            )}
          </div>

          {/* Social Proof / Metrics strip */}
          <div className="pt-8 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto">
            <div className="p-3 rounded-2xl border border-slate-800/80 bg-slate-950/60 backdrop-blur-sm text-center">
              <div className="text-xl sm:text-2xl font-extrabold text-cyan-400">&lt;50ms</div>
              <div className="text-[11px] text-slate-400 font-medium">Cursor Sync Latency</div>
            </div>
            <div className="p-3 rounded-2xl border border-slate-800/80 bg-slate-950/60 backdrop-blur-sm text-center">
              <div className="text-xl sm:text-2xl font-extrabold text-purple-400">100%</div>
              <div className="text-[11px] text-slate-400 font-medium">Conflict-Free CRDT</div>
            </div>
            <div className="p-3 rounded-2xl border border-slate-800/80 bg-slate-950/60 backdrop-blur-sm text-center">
              <div className="text-xl sm:text-2xl font-extrabold text-emerald-400">1 Click</div>
              <div className="text-[11px] text-slate-400 font-medium">Frictionless Guest Mode</div>
            </div>
            <div className="p-3 rounded-2xl border border-slate-800/80 bg-slate-950/60 backdrop-blur-sm text-center">
              <div className="text-xl sm:text-2xl font-extrabold text-pink-400">Zero</div>
              <div className="text-[11px] text-slate-400 font-medium">Setup Required</div>
            </div>
          </div>
        </div>

        {/* 2. Interactive Mockup Visual Preview */}
        <div className="mt-12 sm:mt-16 relative rounded-3xl border border-slate-800 bg-slate-950/80 p-3 sm:p-6 shadow-2xl backdrop-blur-xl max-w-5xl mx-auto overflow-hidden">
          {/* Browser Window Header */}
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800/80 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="ml-2 font-mono text-[11px] text-slate-400 hidden sm:inline">
                https://taskflow.io/board/product-sprint-2026
              </span>
            </div>

            {/* Multiplayer Avatars & Status in Mockup */}
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-mono border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Sync Active
              </span>
              <div className="flex items-center -space-x-1.5">
                <div className="w-6 h-6 rounded-full bg-cyan-500 text-slate-950 font-bold text-[9px] flex items-center justify-center ring-2 ring-slate-900">
                  A
                </div>
                <div className="w-6 h-6 rounded-full bg-purple-500 text-white font-bold text-[9px] flex items-center justify-center ring-2 ring-slate-900">
                  M
                </div>
                <div className="w-6 h-6 rounded-full bg-pink-500 text-white font-bold text-[9px] flex items-center justify-center ring-2 ring-slate-900">
                  S
                </div>
              </div>
            </div>
          </div>

          {/* Simulated Kanban Columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left relative">
            {/* Simulated Live Remote Cursor */}
            <div className="absolute top-10 right-28 hidden lg:flex items-center gap-1.5 pointer-events-none z-30 animate-bounce">
              <MousePointer className="w-4 h-4 text-cyan-400 fill-cyan-400" />
              <span className="px-2 py-0.5 rounded-md bg-cyan-400 text-slate-950 text-[10px] font-bold shadow-md">
                Alex (Typing...)
              </span>
            </div>

            {/* Column 1: In Progress */}
            <div className="p-3.5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span>In Progress</span>
                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px]">2</span>
              </div>

              <div className="p-3 rounded-xl border border-cyan-500/40 bg-slate-950 shadow-md space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    High Priority
                  </span>
                  <span className="text-[10px] text-slate-500">2 comments</span>
                </div>
                <h4 className="text-xs font-bold text-white">Refactor Real-Time WebSocket Engine</h4>
                <p className="text-[11px] text-slate-400 line-clamp-2">
                  Optimized cursor broadcast throttle down to 50ms for maximum fluid spatial awareness.
                </p>
                <div className="flex items-center gap-1.5 pt-1 text-[10px] text-cyan-400 font-mono">
                  <span>#websocket</span>
                  <span>#realtime</span>
                </div>
              </div>

              <div className="p-3 rounded-xl border border-slate-800 bg-slate-950/80 shadow-md space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    Medium
                  </span>
                </div>
                <h4 className="text-xs font-bold text-white">Yjs CRDT Concurrent Rich Text</h4>
                <p className="text-[11px] text-slate-400 line-clamp-2">
                  Multiple collaborators typing simultaneously with TipTap extensions.
                </p>
              </div>
            </div>

            {/* Column 2: Code Review */}
            <div className="p-3.5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span>Code Review</span>
                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px]">1</span>
              </div>

              <div className="p-3 rounded-xl border border-purple-500/40 bg-slate-950 shadow-md space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    Urgent
                  </span>
                  <span className="text-[10px] text-purple-400">Live Editing</span>
                </div>
                <h4 className="text-xs font-bold text-white">Frictionless Guest Link Access</h4>
                <p className="text-[11px] text-slate-400 line-clamp-2">
                  Allow external collaborators to jump right in with temporary guest session tokens.
                </p>
              </div>
            </div>

            {/* Column 3: Production Ready */}
            <div className="p-3.5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span>Production Ready</span>
                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px]">2</span>
              </div>

              <div className="p-3 rounded-xl border border-slate-800 bg-slate-950/80 shadow-md space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Done
                  </span>
                </div>
                <h4 className="text-xs font-bold text-white">Fluid Drag-and-Drop Canvas</h4>
                <p className="text-[11px] text-slate-400 line-clamp-2">
                  Zero-latency optimistic updates powered by @hello-pangea/dnd.
                </p>
              </div>

              <div className="p-3 rounded-xl border border-slate-800 bg-slate-950/80 shadow-md space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Done
                  </span>
                </div>
                <h4 className="text-xs font-bold text-white">Cyber Dark Theme Design</h4>
                <p className="text-[11px] text-slate-400 line-clamp-2">
                  Tailored HSL neon accents, glassmorphic surfaces, and responsive drawers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Features Grid Section */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-bold uppercase tracking-widest border border-cyan-500/20">
            <Flame className="w-3.5 h-3.5 text-cyan-400" />
            <span>Built For Modern Creators</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Engineered with Features That Actually Matter
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm">
            Everything your team needs to collaborate in real-time, eliminate meeting bloat, and deliver results faster.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, idx) => (
            <div
              key={idx}
              className="group p-6 rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900/80 via-slate-950/60 to-slate-950 shadow-xl hover:border-cyan-500/40 transition-all duration-300 relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 group-hover:scale-110 transition-transform">
                  {feat.icon}
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${feat.badgeColor}`}>
                  {feat.tag}
                </span>
              </div>
              <h3 className="text-base font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                {feat.title}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {feat.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. How It Works Section */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs font-bold uppercase tracking-widest border border-purple-500/20">
            <Compass className="w-3.5 h-3.5 text-purple-400" />
            <span>Frictionless Workflow</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            How It Works in 3 Simple Steps
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm">
            No steep learning curve. From idea to full multiplayer collaboration in seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((st, idx) => (
            <div
              key={idx}
              className="p-6 rounded-3xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm relative space-y-4 overflow-hidden"
            >
              <div className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
                {st.number}
              </div>
              <h3 className="text-base font-bold text-white">
                {st.title}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {st.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Comparison Matrix Section */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Why Teams Choose TaskFlow
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm">
            See how TaskFlow stacks up against traditional, sluggish project management tools.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-950/90 shadow-2xl overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[560px]">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/70">
                <th className="p-4 sm:p-5 font-bold text-slate-300">Feature</th>
                <th className="p-4 sm:p-5 font-bold text-cyan-400 bg-cyan-500/10 border-x border-cyan-500/20">
                  TaskFlow (SaaS Edition)
                </th>
                <th className="p-4 sm:p-5 font-bold text-slate-400">Traditional Kanban Tools</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {comparison.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-900/30 transition-colors">
                  <td className="p-4 sm:p-5 font-semibold text-white">
                    {item.feature}
                  </td>
                  <td className="p-4 sm:p-5 bg-cyan-500/5 border-x border-cyan-500/20 font-medium text-cyan-300">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{item.taskflow}</span>
                    </div>
                  </td>
                  <td className="p-4 sm:p-5 text-slate-400">
                    <div className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-rose-500/70 shrink-0" />
                      <span>{item.others}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 6. Testimonials Section */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 text-amber-400 text-xs font-semibold">
            <Star className="w-4 h-4 fill-amber-400" />
            <Star className="w-4 h-4 fill-amber-400" />
            <Star className="w-4 h-4 fill-amber-400" />
            <Star className="w-4 h-4 fill-amber-400" />
            <Star className="w-4 h-4 fill-amber-400" />
            <span className="ml-2 text-slate-300">Loved by Fast-Paced Teams</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Trusted by Builders & Innovators
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="p-6 rounded-3xl border border-slate-800 bg-slate-900/40 backdrop-blur-sm space-y-4 flex flex-col justify-between"
            >
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed italic">
                "{t.quote}"
              </p>
              <div className="flex items-center gap-3 pt-2 border-t border-slate-800/60">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs text-slate-950 shadow-md"
                  style={{ backgroundColor: t.avatarColor }}
                >
                  {t.author.charAt(0)}
                </div>
                <div>
                  <div className="text-xs font-bold text-white">{t.author}</div>
                  <div className="text-[11px] text-slate-400">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. High-Impact Bottom CTA Banner */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="relative overflow-hidden rounded-3xl border border-cyan-500/40 bg-gradient-to-r from-cyan-950/40 via-slate-900/90 to-purple-950/40 p-8 sm:p-12 text-center shadow-2xl backdrop-blur-xl space-y-6">
          <div className="absolute -top-24 -left-24 w-60 h-60 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Ready to Accelerate Your Team's Velocity?
            </h2>
            <p className="text-slate-300 text-xs sm:text-base leading-relaxed">
              Experience the power of real-time multiplayer coordination today. Launch an instant sandbox or register a free workspace.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
              <button
                onClick={handleGuestQuickLaunch}
                disabled={isAuthLoading}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm shadow-xl shadow-cyan-500/25 transition-all active:scale-95 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>Launch Free Sandbox</span>
                <ArrowRight className="w-4 h-4 text-slate-950" />
              </button>

              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl border border-slate-700 hover:border-slate-600 bg-slate-900/90 text-white font-semibold text-sm transition-all active:scale-95"
              >
                <span>Create Workspace</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Professional Footer */}
      <footer className="border-t border-slate-800/80 pt-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-cyan-500 to-purple-600 p-[1px]">
            <div className="w-full h-full bg-slate-950 rounded-[7px] flex items-center justify-center">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
            </div>
          </div>
          <span className="font-bold text-slate-300">TaskFlow SaaS</span>
          <span>• © 2026 All rights reserved.</span>
        </div>

        <div className="flex items-center gap-4 text-slate-400">
          <Link to="/board/demo" className="hover:text-cyan-400 transition-colors">
            Demo Sandbox
          </Link>
          <Link to="/login" className="hover:text-cyan-400 transition-colors">
            Sign In
          </Link>
          <Link to="/register" className="hover:text-cyan-400 transition-colors">
            Register
          </Link>
        </div>
      </footer>
    </div>
  );
};
