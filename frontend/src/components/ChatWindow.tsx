import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import type { ChatMessage, ConversationState, NPC } from '../types/mantella';
import { MessageBubble, TypingIndicator } from './MessageBubble';

interface Props {
  messages: ChatMessage[];
  state: ConversationState;
  npcs: NPC[];
  playerName: string;
  onSend: (text: string) => void;
}

export function ChatWindow({ messages, state, npcs, playerName, onSend }: Props) {
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, state]);

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleSend() {
    const text = input.trim();
    if (!text || state !== 'ACTIVE') return;
    onSend(text);
    setInput('');
    setTimeout(() => textareaRef.current?.focus(), 0);
  }

  const isWaiting = state === 'WAITING';
  const isActive = state === 'ACTIVE';
  const isIdle = state === 'IDLE';

  // Guess which NPC is responding — the last NPC mentioned or the first one
  const activeNpcName = npcs[0]?.name ?? 'NPC';

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-1 scroll-smooth">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
            <div className="text-4xl opacity-10">⚔</div>
            <p className="text-stone-600 text-sm">
              Configure os personagens e inicie uma conversa.
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {isWaiting && <TypingIndicator npcName={activeNpcName} />}

        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-stone-800 px-4 py-3 bg-stone-950/60">
        {isIdle ? (
          <p className="text-center text-xs text-stone-600 py-1">
            Inicie uma conversa para começar a falar.
          </p>
        ) : state === 'ENDED' ? (
          <p className="text-center text-xs text-stone-600 py-1">
            Conversa encerrada. Configure e inicie uma nova.
          </p>
        ) : (
          <div className="flex gap-2 items-end">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={!isActive}
              rows={1}
              placeholder={
                isWaiting
                  ? `${activeNpcName} está respondendo...`
                  : `Fale como ${playerName}... (Enter para enviar)`
              }
              className="flex-1 bg-stone-900 border border-stone-700 rounded-xl px-4 py-2.5 text-sm text-stone-200 placeholder-stone-600 resize-none focus:outline-none focus:border-amber-800 disabled:opacity-40 max-h-32 leading-relaxed"
              style={{ minHeight: '42px' }}
              onInput={(e) => {
                const el = e.currentTarget;
                el.style.height = 'auto';
                el.style.height = Math.min(el.scrollHeight, 128) + 'px';
              }}
            />
            <button
              onClick={handleSend}
              disabled={!isActive || !input.trim()}
              className="px-4 py-2.5 bg-amber-800 hover:bg-amber-700 text-amber-100 text-sm font-semibold rounded-xl transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
            >
              Enviar
            </button>
          </div>
        )}

        <div className="flex justify-between items-center mt-1.5 px-1">
          <span className="text-[10px] text-stone-700">
            {isActive && 'Shift+Enter para nova linha'}
          </span>
          <span className="text-[10px] text-stone-700">
            {messages.filter((m) => m.type === 'player' || m.type === 'npc').length} mensagens
          </span>
        </div>
      </div>
    </div>
  );
}
