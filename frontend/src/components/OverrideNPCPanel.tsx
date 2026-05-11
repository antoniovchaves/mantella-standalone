import { useState, useEffect, useCallback, useRef } from "react";
import type { NPC, OverrideNPC, Race } from "../types/mantella";
import { fetchOverrideNPCs, setOverridePath } from "../services/mantellaApi";

const STORAGE_KEY = "mantella_override_path";

function overrideToNPC(o: OverrideNPC): NPC {
  return {
    name: o.name,
    race: (o.race as Race) || "Nord",
    gender: o.gender,
    is_follower: o.is_follower,
    is_enemy: o.is_enemy,
    relationship_rank: o.relationship_rank,
    ref_id: o.ref_id || "0x00000001",
    base_id: o.base_id || "0x00000002",
    voice_type: o.voice_model,
  };
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

interface Props {
  disabled: boolean;
  onAddNPC: (npc: NPC) => void;
}

export function OverrideNPCPanel({ disabled, onAddNPC }: Props) {
  const [overrideNPCs, setOverrideNPCs] = useState<OverrideNPC[]>([]);
  const [overridePath, setOverridePathState] = useState<string>(
    localStorage.getItem(STORAGE_KEY) || "",
  );
  const [pathExists, setPathExists] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingPath, setEditingPath] = useState(false);
  const [tempPath, setTempPath] = useState("");
  const [expanded, setExpanded] = useState(false);
  const autoExpandedRef = useRef(false);

  const loadNPCs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchOverrideNPCs();
      setOverrideNPCs(result.npcs);
      setPathExists(result.path_exists);
      setOverridePathState(result.override_path);
    } catch {
      setError("Proxy offline or invalid path.");
      setPathExists(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNPCs();
  }, [loadNPCs]);

  useEffect(() => {
    if (overrideNPCs.length > 0 && !autoExpandedRef.current) {
      setExpanded(true);
      autoExpandedRef.current = true;
    }
  }, [overrideNPCs]);

  async function handleSetPath() {
    try {
      const result = await setOverridePath(tempPath);
      setOverridePathState(result.path);
      setPathExists(result.exists);
      localStorage.setItem(STORAGE_KEY, tempPath);
      setEditingPath(false);
      await loadNPCs();
    } catch {
      setError("Could not update the path.");
    }
  }

  // Group by source file
  const byFile = overrideNPCs.reduce<Record<string, OverrideNPC[]>>(
    (acc, npc) => {
      const key = npc._source_file || "no file";
      if (!acc[key]) acc[key] = [];
      acc[key].push(npc);
      return acc;
    },
    {},
  );

  const hasNPCs = overrideNPCs.length > 0;

  return (
    <section>
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between text-xs font-semibold text-stone-500 uppercase tracking-widest mb-2"
      >
        <span>Mantella NPCs {hasNPCs && `(${overrideNPCs.length})`}</span>
        <span className="text-stone-600">{expanded ? "▲" : "▼"}</span>
      </button>

      {expanded && (
        <div className="flex flex-col gap-3">
          {/* Configured path */}
          <div className="bg-stone-900 border border-stone-800 rounded-lg p-2.5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-stone-600 uppercase tracking-widest">
                Override folder
              </span>
              <button
                onClick={() => {
                  setEditingPath(true);
                  setTempPath(overridePath);
                }}
                className="text-[10px] text-amber-700 hover:text-amber-500 transition-colors"
              >
                change
              </button>
            </div>

            {editingPath ? (
              <div className="flex flex-col gap-1.5">
                <input
                  value={tempPath}
                  onChange={(e) => setTempPath(e.target.value)}
                  placeholder="C:\Users\...\Documents\My Games\Mantella\..."
                  className="w-full bg-stone-800 border border-stone-700 rounded px-2 py-1.5 text-[11px] text-stone-300 focus:outline-none focus:border-amber-800"
                />
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setEditingPath(false)}
                    className="flex-1 text-[11px] py-1 border border-stone-700 rounded text-stone-400 hover:border-stone-500 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSetPath}
                    className="flex-1 text-[11px] py-1 bg-amber-900 hover:bg-amber-800 rounded text-amber-200 transition-colors"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <div
                  className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                    pathExists === null
                      ? "bg-stone-600"
                      : pathExists
                        ? "bg-emerald-500"
                        : "bg-red-500"
                  }`}
                />
                <span
                  className="text-[10px] text-stone-500 truncate font-mono"
                  title={overridePath}
                >
                  {overridePath
                    ? overridePath
                        .replace(/\\/g, "/")
                        .split("/")
                        .slice(-3)
                        .join("/")
                    : "not configured"}
                </span>
              </div>
            )}

            {pathExists === false && !editingPath && (
              <p className="text-[10px] text-red-500/70 mt-1.5">
                Folder not found. Default path:
                <br />
                <span className="font-mono">
                  Documents\My Games\Mantella\data\Skyrim\character_overrides
                </span>
              </p>
            )}
          </div>

          {/* Reload button */}
          <button
            onClick={loadNPCs}
            disabled={loading}
            className="text-xs text-stone-500 hover:text-stone-300 transition-colors text-left disabled:animate-pulse"
          >
            {loading ? "Loading..." : `↺ Reload files`}
          </button>

          {error && <p className="text-[11px] text-red-500/70">{error}</p>}

          {/* NPC list grouped by file */}
          {!loading &&
            hasNPCs &&
            Object.entries(byFile).map(([file, npcs]) => (
              <div key={file}>
                <div
                  className="text-[10px] text-stone-600 font-mono mb-1.5 truncate"
                  title={file}
                >
                  📄 {file}
                </div>
                <div className="flex flex-col gap-1.5">
                  {npcs.map((npc, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 bg-stone-900 border border-stone-800 rounded-lg px-2.5 py-1.5"
                    >
                      <div className="w-7 h-7 rounded-full bg-stone-800 border border-stone-700 flex items-center justify-center text-[9px] font-semibold text-stone-400 flex-shrink-0">
                        {getInitials(npc.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-stone-200 truncate">
                          {npc.name}
                        </div>
                        <div className="text-[10px] text-stone-600 truncate">
                          {npc.race} · {npc.gender === "male" ? "♂" : "♀"}
                          {npc.bio && ` · ${npc.bio.slice(0, 30)}…`}
                        </div>
                      </div>
                      <button
                        onClick={() => onAddNPC(overrideToNPC(npc))}
                        disabled={disabled}
                        title="Add to conversation"
                        className="text-amber-700 hover:text-amber-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-sm flex-shrink-0"
                      >
                        +
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}

          {!loading && !hasNPCs && pathExists && (
            <p className="text-[11px] text-stone-600 italic">
              No NPCs found in override files.
              <br />
              Add .json or .csv files to the configured folder.
            </p>
          )}

          {/* Format hint */}
          {!hasNPCs && (
            <details className="text-[10px] text-stone-600">
              <summary className="cursor-pointer hover:text-stone-400 transition-colors">
                How to create an NPC?
              </summary>
              <pre className="mt-2 bg-stone-900 border border-stone-800 rounded p-2 text-emerald-700/80 leading-relaxed overflow-x-auto">{`// my_npc.json
{
  "name": "Aelindra",
  "race": "Dunmer",
  "gender": "female",
  "bio": "Exiled mage from Morrowind...",
  "voice_model": "FemaleEvenToned",
  "ref_id": "0x00000042",
  "base_id": "0x00000043"
}`}</pre>
              <p className="mt-1.5">
                Save to:
                <br />
                <span className="font-mono text-stone-500">
                  Documents\My Games\Mantella\data\Skyrim\character_overrides\
                </span>
              </p>
            </details>
          )}
        </div>
      )}
    </section>
  );
}
