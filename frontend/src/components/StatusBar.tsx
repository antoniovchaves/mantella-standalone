import type { ConversationState } from "../types/mantella";

const STATE_LABELS: Record<ConversationState, string> = {
  IDLE: "Idle",
  CONNECTING: "Connecting...",
  ACTIVE: "In progress",
  WAITING: "Waiting for NPC...",
  ENDED: "Ended",
};

const STATE_COLORS: Record<ConversationState, string> = {
  IDLE: "text-stone-500",
  CONNECTING: "text-amber-400",
  ACTIVE: "text-emerald-400",
  WAITING: "text-amber-400",
  ENDED: "text-stone-500",
};

interface Props {
  state: ConversationState;
  mantellaOnline: boolean | null;
  onPing: () => void;
}

export function StatusBar({ state, mantellaOnline, onPing }: Props) {
  const dotColor =
    mantellaOnline === null
      ? "bg-stone-600"
      : mantellaOnline
        ? "bg-emerald-500"
        : "bg-red-500";

  const dotLabel =
    mantellaOnline === null
      ? "Checking..."
      : mantellaOnline
        ? "Mantella online"
        : "Mantella offline";

  return (
    <div className="flex items-center justify-between px-4 py-2 border-b border-stone-800 bg-stone-950/80 text-xs">
      <div className="flex items-center gap-2">
        <button
          onClick={onPing}
          title="Check connection"
          className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
        >
          <div
            className={`w-2 h-2 rounded-full ${dotColor} ${mantellaOnline ? "animate-pulse" : ""}`}
          />
          <span className="text-stone-400">{dotLabel}</span>
        </button>
        <span className="text-stone-700">·</span>
        <span className="text-stone-500">localhost:4999</span>
      </div>

      <div className={`font-medium tracking-wide ${STATE_COLORS[state]}`}>
        {STATE_LABELS[state]}
      </div>
    </div>
  );
}
