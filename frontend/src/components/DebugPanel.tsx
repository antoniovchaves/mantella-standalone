import { useState, useRef, useEffect } from "react";

interface Props {
  lastRequest: unknown;
  lastResponse: unknown;
}

const MIN_WIDTH = 160;
const MAX_WIDTH = 600;
const DEFAULT_WIDTH = 220;

export function DebugPanel({ lastRequest, lastResponse }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(0);

  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      if (!isDragging.current) return;
      // drag left = increase width (panel is on the right side)
      const delta = startX.current - e.clientX;
      setWidth(
        Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, startWidth.current + delta)),
      );
    }
    function onMouseUp() {
      if (!isDragging.current) return;
      isDragging.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  function handleDragStart(e: React.MouseEvent) {
    e.preventDefault();
    isDragging.current = true;
    startX.current = e.clientX;
    startWidth.current = width;
    document.body.style.cursor = "ew-resize";
    document.body.style.userSelect = "none";
  }

  if (collapsed) {
    return (
      <div
        className="relative flex flex-col h-full overflow-hidden"
        style={{ width: `${width}px` }}
      >
        <div
          onMouseDown={handleDragStart}
          className="absolute left-0 top-0 bottom-0 w-1 cursor-ew-resize hover:bg-amber-800/40 transition-colors z-10"
          title="Drag to resize"
        />
        <button
          onClick={() => setCollapsed(false)}
          className="flex flex-col items-center justify-center h-full w-full text-stone-600 hover:text-stone-400 transition-colors text-xs gap-1"
        >
          <span className="text-lg">{"{ }"}</span>
          <span>Debug</span>
        </button>
      </div>
    );
  }

  return (
    <div
      className="relative flex flex-col h-full overflow-hidden"
      style={{ width: `${width}px` }}
    >
      {/* Resize handle — drag left to widen, right to narrow */}
      <div
        onMouseDown={handleDragStart}
        className="absolute left-0 top-0 bottom-0 w-1 cursor-ew-resize hover:bg-amber-800/40 transition-colors z-10"
        title="Drag to resize"
      />

      <div className="flex items-center justify-between pl-3 pr-2 py-2 border-b border-stone-800">
        <span className="text-xs font-semibold text-stone-500 uppercase tracking-widest">
          Debug JSON
        </span>
        <button
          onClick={() => setCollapsed(true)}
          className="text-stone-700 hover:text-stone-400 transition-colors text-xs px-1"
          title="Collapse"
        >
          →
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-4">
        <div>
          <div className="text-[10px] font-semibold text-stone-600 uppercase tracking-widest mb-1.5">
            Last request
          </div>
          <pre className="text-[10px] text-emerald-600/80 font-mono leading-relaxed bg-stone-900/60 border border-stone-800 rounded-lg p-2.5 overflow-x-auto whitespace-pre-wrap break-all">
            {lastRequest ? JSON.stringify(lastRequest, null, 2) : "—"}
          </pre>
        </div>

        <div>
          <div className="text-[10px] font-semibold text-stone-600 uppercase tracking-widest mb-1.5">
            Last response
          </div>
          <pre className="text-[10px] text-amber-600/80 font-mono leading-relaxed bg-stone-900/60 border border-stone-800 rounded-lg p-2.5 overflow-x-auto whitespace-pre-wrap break-all">
            {lastResponse ? JSON.stringify(lastResponse, null, 2) : "—"}
          </pre>
        </div>
      </div>
    </div>
  );
}
