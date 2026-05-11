import { useState, useEffect } from 'react';
import type { Player, NPC, Race, Gender } from '../types/mantella';
import type { ConversationState } from '../types/mantella';
import { NPC_PRESETS } from '../data/presets';
import { OverrideNPCPanel } from './OverrideNPCPanel';

const RACES: Race[] = [
  'Nord', 'Imperial', 'Breton', 'Dunmer', 'Altmer',
  'Bosmer', 'Orc', 'Khajiit', 'Argonian', 'Redguard',
];

const STORAGE_KEY = 'mantella_config';

function loadFromStorage(): { player: Player; npcs: NPC[] } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveToStorage(player: Player, npcs: NPC[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ player, npcs }));
}

const DEFAULT_PLAYER: Player = {
  name: 'Dovahkiin',
  race: 'Nord',
  gender: 'male',
  location: 'Whiterun',
  in_game_time: '14:30',
};

interface Props {
  state: ConversationState;
  onStart: (player: Player, npcs: NPC[]) => void;
  onEnd: () => void;
  onReset: () => void;
}

export function CharacterConfig({ state, onStart, onEnd, onReset }: Props) {
  const saved = loadFromStorage();
  const [player, setPlayer] = useState<Player>(saved?.player ?? DEFAULT_PLAYER);
  const [npcs, setNpcs] = useState<NPC[]>(saved?.npcs ?? []);
  const [editingNpc, setEditingNpc] = useState<NPC | null>(null);
  const [isAddingNpc, setIsAddingNpc] = useState(false);

  useEffect(() => {
    saveToStorage(player, npcs);
  }, [player, npcs]);

  const isActive = state === 'ACTIVE' || state === 'WAITING' || state === 'CONNECTING';

  function applyPreset(presetId: string) {
    const preset = NPC_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    const already = npcs.find((n) => n.name === preset.npc.name);
    if (!already) {
      setNpcs((prev) => [...prev, preset.npc]);
    }
    if (preset.suggestedLocation && !isActive) {
      setPlayer((p) => ({ ...p, location: preset.suggestedLocation! }));
    }
  }

  function removeNpc(index: number) {
    setNpcs((prev) => prev.filter((_, i) => i !== index));
  }

  function updatePlayer<K extends keyof Player>(key: K, value: Player[K]) {
    setPlayer((p) => ({ ...p, [key]: value }));
  }

  function getInitials(name: string) {
    return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  }

  const blankNpc: NPC = {
    name: '', race: 'Nord', gender: 'male',
    is_follower: false, is_enemy: false, relationship_rank: 0,
    ref_id: '0x00000001', base_id: '0x00000002',
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="px-4 py-3 border-b border-stone-800">
        <h1 className="text-sm font-semibold tracking-widest text-amber-500/80 uppercase">
          Mantella Standalone
        </h1>
        <p className="text-xs text-stone-600 mt-0.5">Interface de simulação</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-5">

        {/* Player config */}
        <section>
          <h2 className="text-xs font-semibold text-stone-500 uppercase tracking-widest mb-3">Jogador</h2>
          <div className="flex flex-col gap-2">
            <input
              disabled={isActive}
              value={player.name}
              onChange={(e) => updatePlayer('name', e.target.value)}
              placeholder="Nome"
              className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-sm text-stone-200 placeholder-stone-600 focus:outline-none focus:border-amber-700 disabled:opacity-40"
            />
            <div className="grid grid-cols-2 gap-2">
              <select
                disabled={isActive}
                value={player.race}
                onChange={(e) => updatePlayer('race', e.target.value as Race)}
                className="bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-sm text-stone-200 focus:outline-none focus:border-amber-700 disabled:opacity-40"
              >
                {RACES.map((r) => <option key={r}>{r}</option>)}
              </select>
              <select
                disabled={isActive}
                value={player.gender}
                onChange={(e) => updatePlayer('gender', e.target.value as Gender)}
                className="bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-sm text-stone-200 focus:outline-none focus:border-amber-700 disabled:opacity-40"
              >
                <option value="male">Masculino</option>
                <option value="female">Feminino</option>
              </select>
            </div>
            <input
              disabled={isActive}
              value={player.location}
              onChange={(e) => updatePlayer('location', e.target.value)}
              placeholder="Localização"
              className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-sm text-stone-200 placeholder-stone-600 focus:outline-none focus:border-amber-700 disabled:opacity-40"
            />
            <input
              disabled={isActive}
              value={player.in_game_time}
              onChange={(e) => updatePlayer('in_game_time', e.target.value)}
              placeholder="Hora (HH:MM)"
              pattern="[0-9]{2}:[0-9]{2}"
              className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-sm text-stone-200 placeholder-stone-600 focus:outline-none focus:border-amber-700 disabled:opacity-40"
            />
          </div>
        </section>

        {/* Presets */}
        <section>
          <h2 className="text-xs font-semibold text-stone-500 uppercase tracking-widest mb-3">Presets de NPC</h2>
          <div className="flex flex-wrap gap-1.5">
            {NPC_PRESETS.map((p) => (
              <button
                key={p.id}
                onClick={() => applyPreset(p.id)}
                disabled={isActive}
                className="text-xs px-2.5 py-1 rounded-full border border-stone-700 text-stone-400 hover:border-amber-700 hover:text-amber-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                + {p.label}
              </button>
            ))}
          </div>
        </section>

        {/* NPCs do Mantella (override) */}
        <OverrideNPCPanel
          disabled={isActive}
          onAddNPC={(npc) => {
            const already = npcs.find((n) => n.name === npc.name);
            if (!already) setNpcs((prev) => [...prev, npc]);
          }}
        />

        {/* NPCs */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold text-stone-500 uppercase tracking-widest">
              NPCs ({npcs.length})
            </h2>
            {!isActive && (
              <button
                onClick={() => { setEditingNpc(blankNpc); setIsAddingNpc(true); }}
                className="text-xs text-amber-600 hover:text-amber-400 transition-colors"
              >
                + Adicionar
              </button>
            )}
          </div>

          {npcs.length === 0 && (
            <p className="text-xs text-stone-600 italic">Nenhum NPC configurado.</p>
          )}

          <div className="flex flex-col gap-2">
            {npcs.map((npc, i) => (
              <div key={i} className="flex items-center gap-2.5 bg-stone-900 border border-stone-800 rounded-lg px-3 py-2">
                <div className="w-8 h-8 rounded-full bg-stone-800 border border-stone-700 flex items-center justify-center text-[10px] font-semibold text-stone-400 flex-shrink-0">
                  {getInitials(npc.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-stone-200 truncate">{npc.name}</div>
                  <div className="text-xs text-stone-600">
                    {npc.race} · {npc.gender === 'male' ? '♂' : '♀'}
                    {npc.is_follower && ' · Companheiro'}
                    {npc.is_enemy && ' · Inimigo'}
                  </div>
                </div>
                {!isActive && (
                  <button
                    onClick={() => removeNpc(i)}
                    className="text-stone-700 hover:text-red-500 transition-colors text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* NPC Editor modal-style */}
        {editingNpc && (
          <NpcEditor
            npc={editingNpc}
            onSave={(n) => {
              if (isAddingNpc) setNpcs((prev) => [...prev, n]);
              setEditingNpc(null);
              setIsAddingNpc(false);
            }}
            onCancel={() => { setEditingNpc(null); setIsAddingNpc(false); }}
          />
        )}
      </div>

      {/* Actions */}
      <div className="px-4 py-4 border-t border-stone-800 flex flex-col gap-2">
        {state === 'IDLE' || state === 'ENDED' ? (
          <>
            {state === 'ENDED' && (
              <button
                onClick={onReset}
                className="w-full py-2 text-sm text-stone-400 border border-stone-700 rounded-lg hover:border-stone-500 transition-colors"
              >
                Nova conversa
              </button>
            )}
            <button
              onClick={() => onStart(player, npcs)}
              disabled={npcs.length === 0 || !player.name}
              className="w-full py-2.5 text-sm font-semibold bg-amber-800 hover:bg-amber-700 text-amber-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              ▶ Iniciar conversa
            </button>
          </>
        ) : state === 'CONNECTING' ? (
          <button disabled className="w-full py-2.5 text-sm text-stone-500 border border-stone-700 rounded-lg animate-pulse">
            Conectando...
          </button>
        ) : (
          <button
            onClick={onEnd}
            className="w-full py-2.5 text-sm font-semibold border border-red-900 text-red-400 hover:bg-red-950/40 rounded-lg transition-colors"
          >
            ✕ Encerrar conversa
          </button>
        )}
      </div>
    </div>
  );
}

function NpcEditor({ npc, onSave, onCancel }: { npc: NPC; onSave: (n: NPC) => void; onCancel: () => void }) {
  const [form, setForm] = useState<NPC>(npc);

  function set<K extends keyof NPC>(key: K, value: NPC[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  const RACES: Race[] = ['Nord','Imperial','Breton','Dunmer','Altmer','Bosmer','Orc','Khajiit','Argonian','Redguard'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-stone-950 border border-stone-700 rounded-xl p-5 w-full max-w-sm flex flex-col gap-3 shadow-2xl">
        <h3 className="text-sm font-semibold text-amber-500">Configurar NPC</h3>
        <input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Nome" className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-sm text-stone-200 focus:outline-none" />
        <div className="grid grid-cols-2 gap-2">
          <select value={form.race} onChange={(e) => set('race', e.target.value as Race)} className="bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-sm text-stone-200">
            {RACES.map((r) => <option key={r}>{r}</option>)}
          </select>
          <select value={form.gender} onChange={(e) => set('gender', e.target.value as Gender)} className="bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-sm text-stone-200">
            <option value="male">Masculino</option>
            <option value="female">Feminino</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <input value={form.ref_id} onChange={(e) => set('ref_id', e.target.value)} placeholder="Ref ID" className="bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-sm text-stone-200 focus:outline-none" />
          <input value={form.base_id} onChange={(e) => set('base_id', e.target.value)} placeholder="Base ID" className="bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-sm text-stone-200 focus:outline-none" />
        </div>
        <div>
          <label className="text-xs text-stone-500">Relationship rank: {form.relationship_rank}</label>
          <input type="range" min={-4} max={4} value={form.relationship_rank} onChange={(e) => set('relationship_rank', Number(e.target.value))} className="w-full mt-1" />
        </div>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-sm text-stone-300 cursor-pointer">
            <input type="checkbox" checked={form.is_follower} onChange={(e) => set('is_follower', e.target.checked)} />
            Companheiro
          </label>
          <label className="flex items-center gap-2 text-sm text-stone-300 cursor-pointer">
            <input type="checkbox" checked={form.is_enemy} onChange={(e) => set('is_enemy', e.target.checked)} />
            Inimigo
          </label>
        </div>
        <div className="flex gap-2 mt-1">
          <button onClick={onCancel} className="flex-1 py-2 text-sm text-stone-400 border border-stone-700 rounded-lg hover:border-stone-500 transition-colors">
            Cancelar
          </button>
          <button onClick={() => form.name && onSave(form)} disabled={!form.name} className="flex-1 py-2 text-sm font-semibold bg-amber-800 hover:bg-amber-700 text-amber-100 rounded-lg transition-colors disabled:opacity-30">
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}
