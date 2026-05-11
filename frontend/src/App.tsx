import { useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Player, NPC, AppScreen, ExperimentResult } from './types/mantella';
import { useConversation } from './hooks/useConversation';
import { CharacterConfig } from './components/CharacterConfig';
import { ChatWindow } from './components/ChatWindow';
import { StatusBar } from './components/StatusBar';
import { DebugPanel } from './components/DebugPanel';
import { ContextScreen } from './components/ContextScreen';
import { StandbyButton } from './components/StandbyButton';
import { QuestionnaireScreen } from './components/QuestionnaireScreen';

export default function App() {
  const {
    state,
    messages,
    mantellaOnline,
    lastRequest,
    lastResponse,
    ping,
    begin,
    speak,
    end,
    reset,
  } = useConversation();

  const [screen, setScreen] = useState<AppScreen>('context');
  const [currentPlayer, setCurrentPlayer] = useState<Player>({
    name: 'Dovahkiin',
    race: 'Nord',
    gender: 'male',
    location: 'Whiterun',
    in_game_time: '14:30',
  });
  const [currentNpcs, setCurrentNpcs] = useState<NPC[]>([]);

  const sessionIdRef = useRef<string>(uuidv4());
  const startedAtRef = useRef<string>(new Date().toISOString());
  const chatStartedAtRef = useRef<Date | null>(null);

  useEffect(() => {
    ping();
    const interval = setInterval(ping, 15_000);
    return () => clearInterval(interval);
  }, [ping]);

  function handleContextDone() {
    setScreen('chat');
  }

  function handleStart(player: Player, npcs: NPC[]) {
    setCurrentPlayer(player);
    setCurrentNpcs(npcs);
    chatStartedAtRef.current = new Date();
    begin(player, npcs);
  }

  async function handleFinishExperiment() {
    await end();
    setScreen('questionnaire');
  }

  function buildPartialResult(): Omit<ExperimentResult, 'answers' | 'likertMode'> {
    const now = new Date();
    const started = chatStartedAtRef.current ?? now;
    const durationSeconds = Math.round((now.getTime() - started.getTime()) / 1000);
    const chatMessages = messages.filter((m) => m.type === 'player' || m.type === 'npc');
    return {
      sessionId: sessionIdRef.current,
      startedAt: startedAtRef.current,
      endedAt: now.toISOString(),
      conversationDuration: durationSeconds,
      messageCount: chatMessages.length,
      npcs: currentNpcs.map((n) => n.name),
      playerName: currentPlayer.name,
      conversationLog: chatMessages.map((m) => ({
        role: m.type === 'player' ? 'player' : m.sender ?? 'npc',
        content: m.content,
        timestamp: m.timestamp.toISOString(),
      })),
    };
  }

  function handleQuestionnaireDone() {
    sessionIdRef.current = uuidv4();
    startedAtRef.current = new Date().toISOString();
    chatStartedAtRef.current = null;
    reset();
    setCurrentNpcs([]);
    setScreen('context');
  }

  if (screen === 'context') {
    return <ContextScreen onStart={handleContextDone} />;
  }

  if (screen === 'questionnaire') {
    return (
      <QuestionnaireScreen
        result={buildPartialResult()}
        onDone={handleQuestionnaireDone}
      />
    );
  }

  const isConversationActive =
    state === 'ACTIVE' || state === 'WAITING' || state === 'CONNECTING';

  return (
    <div className="flex flex-col h-screen bg-stone-950 text-stone-200 font-sans overflow-hidden">
      <StatusBar state={state} mantellaOnline={mantellaOnline} onPing={ping} />

      {isConversationActive && (
        <div className="flex items-center justify-between px-4 py-2 bg-stone-900/80 border-b border-stone-800">
          <span className="text-xs text-stone-600 italic">
            Experimento em andamento · {messages.filter((m) => m.type === 'player').length} mensagens enviadas
          </span>
          <StandbyButton onFinish={handleFinishExperiment} />
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 flex-shrink-0 border-r border-stone-800 bg-stone-950 overflow-hidden flex flex-col">
          <CharacterConfig
            state={state}
            onStart={handleStart}
            onEnd={end}
            onReset={reset}
          />
        </aside>

        <main className="flex-1 overflow-hidden flex flex-col">
          <ChatWindow
            messages={messages}
            state={state}
            npcs={currentNpcs}
            playerName={currentPlayer.name}
            onSend={(text) => speak(text, currentPlayer.name)}
          />
        </main>

        <aside className="w-52 flex-shrink-0 border-l border-stone-800 bg-stone-950 overflow-hidden flex flex-col">
          <DebugPanel lastRequest={lastRequest} lastResponse={lastResponse} />
        </aside>
      </div>
    </div>
  );
}
