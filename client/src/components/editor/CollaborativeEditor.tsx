import React, { useEffect, useState, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { 
  Bold, 
  Italic, 
  Strikethrough, 
  Code, 
  Heading2, 
  Heading3, 
  List, 
  ListOrdered, 
  Quote, 
  Undo, 
  Redo,
  Sparkles,
  Users
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useBoardStore } from '@/store/useBoardStore';

interface CollaborativeEditorProps {
  cardId: string;
}

interface CollaboratorInfo {
  clientId: number;
  name: string;
  color: string;
}

interface EditorInnerProps {
  cardId: string;
  ydoc: Y.Doc;
  provider: WebsocketProvider;
}

/**
 * Inner TipTap editor component that receives active, established Yjs session
 */
const TipTapEditorInner: React.FC<EditorInnerProps> = ({ cardId, ydoc, provider }) => {
  const { user } = useAuthStore();
  const { updateCard } = useBoardStore();
  const updateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [collaborators, setCollaborators] = useState<CollaboratorInfo[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(() => provider.wsconnected);

  // Sync awareness and connection status
  useEffect(() => {
    const awareness = provider.awareness;

    const userProfile = {
      name: user?.name || 'Anonymous Collaborator',
      color: user?.avatarColor || '#06b6d4',
    };

    awareness.setLocalStateField('user', userProfile);

    // Initial connection state
    setIsConnected(provider.wsconnected);

    const onStatus = ({ status }: { status: string }) => {
      setIsConnected(status === 'connected');
    };

    const onAwarenessChange = () => {
      const states = awareness.getStates();
      const active: CollaboratorInfo[] = [];

      states.forEach((state, clientId) => {
        if (state.user) {
          active.push({
            clientId,
            name: state.user.name,
            color: state.user.color,
          });
        }
      });

      setCollaborators(active);
    };

    provider.on('status', onStatus);
    awareness.on('change', onAwarenessChange);

    // Initial populate of awareness
    onAwarenessChange();

    return () => {
      provider.off('status', onStatus);
      awareness.off('change', onAwarenessChange);
    };
  }, [provider, user]);

  // TipTap Editor instance bound to the stable Yjs doc & provider
  const editor = useEditor(
    {
      extensions: [
        StarterKit.configure({
          // Yjs manages history independently to avoid multi-user undo conflicts
          history: false,
        }),
        Collaboration.configure({
          document: ydoc,
        }),
        CollaborationCursor.configure({
          provider,
          user: {
            name: user?.name || 'Collaborator',
            color: user?.avatarColor || '#06b6d4',
          },
        }),
      ],
      editorProps: {
        attributes: {
          class:
            'min-h-[140px] max-h-[360px] overflow-y-auto px-4 py-3 text-sm text-slate-200 focus:outline-none leading-relaxed prose prose-invert max-w-none',
        },
      },
      onUpdate: ({ editor }) => {
        const plainText = editor.getText().trim();
        if (updateTimerRef.current) clearTimeout(updateTimerRef.current);
        updateTimerRef.current = setTimeout(() => {
          updateCard(cardId, { description: plainText });
        }, 500);
      },
    },
    [ydoc, provider, cardId]
  );

  if (!editor) {
    return (
      <div className="h-32 flex items-center justify-center text-xs text-slate-500 font-mono">
        Initializing collaborative editor...
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-lg backdrop-blur-sm transition-all focus-within:border-cyan-500/60">
      {/* Collaboration Status & Active Typers Bar */}
      <div className="px-2.5 sm:px-3.5 py-2 border-b border-slate-800/80 bg-slate-950/70 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span
            className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full shrink-0 transition-all duration-300 ${
              isConnected
                ? 'bg-emerald-400 shadow-[0_0_10px_#34d399] animate-pulse'
                : 'bg-amber-400 shadow-[0_0_8px_#fbbf24]'
            }`}
          />
          <span className="font-semibold text-[10px] sm:text-[11px] text-slate-300 flex items-center gap-1 sm:gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>CRDT Editor</span>
          </span>
          <span className={`text-[9px] sm:text-[10px] font-mono px-1 sm:px-1.5 py-0.5 rounded ${
            isConnected ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
          }`}>
            {isConnected ? 'LIVE' : 'OFFLINE'}
          </span>
        </div>

        {/* Collaborators Active in this Card */}
        <div className="flex items-center gap-1.5 text-xs">
          <Users className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <div className="flex items-center -space-x-1.5">
            {collaborators.map((c) => (
              <div
                key={c.clientId}
                title={`${c.name} is editing this card`}
                className="w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center text-[8px] sm:text-[9px] font-bold text-slate-950 border border-slate-900 ring-1 ring-white/10"
                style={{ backgroundColor: c.color }}
              >
                {c.name.charAt(0).toUpperCase()}
              </div>
            ))}
          </div>
          <span className="text-[10px] sm:text-[11px] text-slate-400 font-mono ml-0.5">
            {collaborators.length} <span className="hidden sm:inline">editing</span>
          </span>
        </div>
      </div>

      {/* Formatting Toolbar */}
      <div className="px-2 py-1.5 border-b border-slate-800/60 bg-slate-900/40 flex items-center gap-1 overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ${
            editor.isActive('bold') ? 'bg-cyan-500/20 text-cyan-300 font-bold' : ''
          }`}
          title="Bold (Ctrl+B)"
        >
          <Bold className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ${
            editor.isActive('italic') ? 'bg-cyan-500/20 text-cyan-300' : ''
          }`}
          title="Italic (Ctrl+I)"
        >
          <Italic className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ${
            editor.isActive('strike') ? 'bg-cyan-500/20 text-cyan-300' : ''
          }`}
          title="Strikethrough"
        >
          <Strikethrough className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={`p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ${
            editor.isActive('code') ? 'bg-cyan-500/20 text-cyan-300' : ''
          }`}
          title="Inline Code"
        >
          <Code className="w-3.5 h-3.5" />
        </button>

        <div className="w-[1px] h-4 bg-slate-800 mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ${
            editor.isActive('heading', { level: 2 }) ? 'bg-cyan-500/20 text-cyan-300' : ''
          }`}
          title="Heading 2"
        >
          <Heading2 className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ${
            editor.isActive('heading', { level: 3 }) ? 'bg-cyan-500/20 text-cyan-300' : ''
          }`}
          title="Heading 3"
        >
          <Heading3 className="w-3.5 h-3.5" />
        </button>

        <div className="w-[1px] h-4 bg-slate-800 mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ${
            editor.isActive('bulletList') ? 'bg-cyan-500/20 text-cyan-300' : ''
          }`}
          title="Bullet List"
        >
          <List className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ${
            editor.isActive('orderedList') ? 'bg-cyan-500/20 text-cyan-300' : ''
          }`}
          title="Numbered List"
        >
          <ListOrdered className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ${
            editor.isActive('blockquote') ? 'bg-cyan-500/20 text-cyan-300' : ''
          }`}
          title="Quote Block"
        >
          <Quote className="w-3.5 h-3.5" />
        </button>

        <div className="w-[1px] h-4 bg-slate-800 mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-30 cursor-pointer"
          title="Undo (Ctrl+Z)"
        >
          <Undo className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-30 cursor-pointer"
          title="Redo (Ctrl+Y)"
        >
          <Redo className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Editor Content Area */}
      <EditorContent editor={editor} />
    </div>
  );
};

/**
 * Main CollaborativeEditor component managing the Yjs Doc & Provider lifecycle
 */
export const CollaborativeEditor: React.FC<CollaborativeEditorProps> = ({ cardId }) => {
  const [session, setSession] = useState<{ ydoc: Y.Doc; provider: WebsocketProvider } | null>(null);

  // Manage Y.Doc and WebsocketProvider lifecycle cleanly for cardId
  useEffect(() => {
    const doc = new Y.Doc();
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/yjs`;

    const wsProvider = new WebsocketProvider(wsUrl, `card-${cardId}`, doc, {
      connect: true,
    });

    setSession({ ydoc: doc, provider: wsProvider });

    return () => {
      wsProvider.destroy();
      doc.destroy();
      setSession(null);
    };
  }, [cardId]);

  if (!session) {
    return (
      <div className="h-32 flex items-center justify-center text-xs text-slate-500 font-mono">
        Initializing collaborative session...
      </div>
    );
  }

  return <TipTapEditorInner key={cardId} cardId={cardId} ydoc={session.ydoc} provider={session.provider} />;
};
