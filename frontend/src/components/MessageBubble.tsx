import type { ChatMessage } from "../types/mantella";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

interface Props {
  message: ChatMessage;
  isContinuation?: boolean;
}

export function MessageBubble({ message, isContinuation = false }: Props) {
  const { type, content, sender, action } = message;

  if (type === "system") {
    return (
      <div className="flex justify-center my-2">
        <span className="text-xs text-stone-500 italic tracking-wide px-3 py-1 rounded-full border border-stone-700/40 bg-stone-900/40">
          {content}
        </span>
      </div>
    );
  }

  if (type === "error") {
    return (
      <div className="flex justify-center my-2">
        <span className="text-xs text-red-400 italic px-3 py-1 rounded-full border border-red-800/40 bg-red-950/30">
          ⚠ {content}
        </span>
      </div>
    );
  }

  if (type === "player") {
    return (
      <div
        className={`flex flex-col items-end gap-1 ${isContinuation ? "mt-0.5" : "mb-3"}`}
      >
        {!isContinuation && (
          <span className="text-xs text-stone-500 mr-1">{sender}</span>
        )}
        <div className="max-w-[70%] px-4 py-2.5 rounded-2xl rounded-br-sm bg-amber-900/70 border border-amber-700/30 text-amber-100 text-sm leading-relaxed shadow-sm">
          {content}
        </div>
      </div>
    );
  }

  // NPC message
  return (
    <div
      className={`flex flex-col items-start gap-1 ${isContinuation ? "mt-0.5" : "mb-3"}`}
    >
      {!isContinuation && (
        <div className="flex items-center gap-2 ml-1">
          <div className="w-6 h-6 rounded-full bg-stone-700 border border-stone-600 flex items-center justify-center text-[9px] font-semibold text-stone-300">
            {getInitials(sender ?? "NPC")}
          </div>
          <span className="text-xs text-stone-400">{sender}</span>
        </div>
      )}
      <div className="max-w-[70%] ml-1 px-4 py-2.5 rounded-2xl rounded-tl-sm bg-stone-800 border border-stone-700/60 text-stone-200 text-sm leading-relaxed shadow-sm">
        {content}
        {action && (
          <div className="mt-1.5 text-xs text-stone-500 italic border-t border-stone-700 pt-1">
            Action: {action}
          </div>
        )}
      </div>
    </div>
  );
}

export function TypingIndicator({ npcName }: { npcName: string }) {
  return (
    <div className="flex flex-col items-start gap-1 mb-3">
      <div className="flex items-center gap-2 ml-1">
        <div className="w-6 h-6 rounded-full bg-stone-700 border border-stone-600 flex items-center justify-center text-[9px] font-semibold text-stone-300">
          {getInitials(npcName)}
        </div>
        <span className="text-xs text-stone-400">{npcName}</span>
      </div>
      <div className="ml-1 px-4 py-3 rounded-2xl rounded-tl-sm bg-stone-800 border border-stone-700/60">
        <div className="flex gap-1 items-center">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-stone-500"
              style={{ animation: `bounce 1.2s ${i * 0.2}s infinite` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
