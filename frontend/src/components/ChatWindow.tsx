import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import type { ChatMessage, ConversationState, NPC } from "../types/mantella";
import { MessageBubble, TypingIndicator } from "./MessageBubble";
import { EXPERIMENT_CHAT_BANNER } from "../data/experiment";

interface Props {
  messages: ChatMessage[];
  state: ConversationState;
  npcs: NPC[];
  playerName: string;
  onSend: (text: string) => void;
}

export function ChatWindow({
  messages,
  state,
  npcs,
  playerName,
  onSend,
}: Props) {
  const [input, setInput] = useState("");
  const [bannerExpanded, setBannerExpanded] = useState(true);
  const [leverOpen, setLeverOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const leverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, state]);

  // Close lever dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (leverRef.current && !leverRef.current.contains(e.target as Node)) {
        setLeverOpen(false);
      }
    }
    if (leverOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [leverOpen]);

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleSend() {
    const text = input.trim();
    if (!text || state !== "ACTIVE") return;
    onSend(text);
    setInput("");
    setTimeout(() => textareaRef.current?.focus(), 0);
  }

  function handlePullLever(npcName: string) {
    setLeverOpen(false);
    onSend(`*Pulls the lever that kills ${npcName}. He is drop dead forever*`);
  }

  const isWaiting = state === "WAITING";
  const isActive = state === "ACTIVE";
  const isIdle = state === "IDLE";
  const activeNpcName = npcs[0]?.name ?? "NPC";

  return (
    <div className="flex flex-col h-full">

      {/* Scenario banner */}
      <div className="border-b border-stone-800 bg-stone-900/60">
        <button
          onClick={() => setBannerExpanded((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-2 text-left"
        >
          <span className="text-[10px] font-semibold text-amber-700/80 uppercase tracking-widest">
            Scenario
          </span>
          <span className="text-stone-600 text-[10px]">
            {bannerExpanded ? "▲ hide" : "▼ show"}
          </span>
        </button>
        {bannerExpanded && (
          <div className="px-4 pb-3">
            <p className="text-xs text-stone-400 leading-relaxed whitespace-pre-line">
              {EXPERIMENT_CHAT_BANNER}
            </p>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-1 scroll-smooth">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
            <div className="text-4xl opacity-10">⚔</div>
            <p className="text-stone-600 text-sm">
              Configure characters and start a conversation.
            </p>
          </div>
        )}

        {messages.map((msg, i) => {
          const prev = messages[i - 1];
          const isContinuation =
            i > 0 &&
            msg.type === prev.type &&
            (msg.type === "npc" || msg.type === "player") &&
            msg.sender === prev.sender;
          return (
            <MessageBubble
              key={msg.id}
              message={msg}
              isContinuation={isContinuation}
            />
          );
        })}

        {isWaiting && <TypingIndicator npcName={activeNpcName} />}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-stone-800 px-4 py-3 bg-stone-950/60">
        {isIdle ? (
          <p className="text-center text-xs text-stone-600 py-1">
            Start a conversation to begin talking.
          </p>
        ) : state === "ENDED" ? (
          <p className="text-center text-xs text-stone-600 py-1">
            Conversation ended. Configure and start a new one.
          </p>
        ) : (
          <>
            {/* Lever button row */}
            {isActive && npcs.length > 0 && (
              <div className="flex justify-end mb-2" ref={leverRef}>
                <div className="relative">
                  <button
                    onClick={() => setLeverOpen((v) => !v)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-950/60 hover:bg-red-900/70 border border-red-800/50 hover:border-red-700/60 text-red-300 text-xs font-semibold rounded-lg transition-colors"
                  >
                    <span>⚙</span>
                    Pull a lever
                    <span className="text-red-500">{leverOpen ? "▲" : "▼"}</span>
                  </button>

                  {leverOpen && (
                    <div className="absolute bottom-full right-0 mb-1.5 bg-stone-900 border border-stone-700 rounded-xl shadow-2xl overflow-hidden min-w-[160px]">
                      <div className="px-3 py-1.5 border-b border-stone-800">
                        <span className="text-[10px] text-stone-500 uppercase tracking-widest">
                          Choose a lever
                        </span>
                      </div>
                      {npcs.map((npc) => (
                        <button
                          key={npc.name}
                          onClick={() => handlePullLever(npc.name)}
                          className="w-full text-left px-3 py-2.5 text-sm text-red-300 hover:bg-red-950/50 transition-colors flex items-center gap-2"
                        >
                          <span className="text-red-600 text-xs">☠</span>
                          Kill {npc.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Text input row */}
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
                    ? `${activeNpcName} is responding...`
                    : `Speak as ${playerName}... (Enter to send)`
                }
                className="flex-1 bg-stone-900 border border-stone-700 rounded-xl px-4 py-2.5 text-sm text-stone-200 placeholder-stone-600 resize-none focus:outline-none focus:border-amber-800 disabled:opacity-40 max-h-32 leading-relaxed"
                style={{ minHeight: "42px" }}
                onInput={(e) => {
                  const el = e.currentTarget;
                  el.style.height = "auto";
                  el.style.height = Math.min(el.scrollHeight, 128) + "px";
                }}
              />
              <button
                onClick={handleSend}
                disabled={!isActive || !input.trim()}
                className="px-4 py-2.5 bg-amber-800 hover:bg-amber-700 text-amber-100 text-sm font-semibold rounded-xl transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
              >
                Send
              </button>
            </div>
          </>
        )}

        <div className="flex justify-between items-center mt-1.5 px-1">
          <span className="text-[10px] text-stone-700">
            {isActive && "Shift+Enter for new line"}
          </span>
          <span className="text-[10px] text-stone-700">
            {messages.filter((m) => m.type === "player" || m.type === "npc").length} messages
          </span>
        </div>
      </div>
    </div>
  );
}
