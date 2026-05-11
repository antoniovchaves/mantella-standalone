import { useState } from "react";

interface Props {
  onFinish: () => void;
}

export function StandbyButton({ onFinish }: Props) {
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-stone-900 border border-red-900/60 rounded-xl">
        <span className="text-xs text-stone-400">End experiment?</span>
        <button
          onClick={onFinish}
          className="px-3 py-1.5 bg-red-900 hover:bg-red-800 text-red-100 text-xs font-semibold rounded-lg transition-colors"
        >
          Yes, end
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="px-3 py-1.5 border border-stone-700 text-stone-400 text-xs rounded-lg hover:border-stone-500 transition-colors"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="flex items-center gap-2 px-4 py-2 border border-amber-800/50 text-amber-600 hover:bg-amber-950/40 hover:border-amber-700 text-xs font-semibold rounded-xl transition-all duration-150"
    >
      <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse" />
      End experiment
    </button>
  );
}
