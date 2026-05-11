import { useState } from 'react';

interface Props {
  lastRequest: unknown;
  lastResponse: unknown;
}

export function DebugPanel({ lastRequest, lastResponse }: Props) {
  const [collapsed, setCollapsed] = useState(false);

  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        className="flex flex-col items-center justify-center h-full w-full text-stone-600 hover:text-stone-400 transition-colors text-xs gap-1"
      >
        <span className="text-lg">{'{ }'}</span>
        <span>Debug</span>
      </button>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-stone-800">
        <span className="text-xs font-semibold text-stone-500 uppercase tracking-widest">Debug JSON</span>
        <button onClick={() => setCollapsed(true)} className="text-stone-700 hover:text-stone-400 transition-colors text-xs">
          ←
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-4">
        <div>
          <div className="text-[10px] font-semibold text-stone-600 uppercase tracking-widest mb-1.5">
            Última requisição
          </div>
          <pre className="text-[10px] text-emerald-600/80 font-mono leading-relaxed bg-stone-900/60 border border-stone-800 rounded-lg p-2.5 overflow-x-auto whitespace-pre-wrap break-all">
            {lastRequest ? JSON.stringify(lastRequest, null, 2) : '—'}
          </pre>
        </div>

        <div>
          <div className="text-[10px] font-semibold text-stone-600 uppercase tracking-widest mb-1.5">
            Última resposta
          </div>
          <pre className="text-[10px] text-amber-600/80 font-mono leading-relaxed bg-stone-900/60 border border-stone-800 rounded-lg p-2.5 overflow-x-auto whitespace-pre-wrap break-all">
            {lastResponse ? JSON.stringify(lastResponse, null, 2) : '—'}
          </pre>
        </div>
      </div>
    </div>
  );
}
