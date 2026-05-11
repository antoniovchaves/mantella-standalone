import { useState, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type {
  ConversationState,
  ChatMessage,
  Player,
  NPC,
  ConversationLog,
} from '../types/mantella';
import {
  startConversation,
  sendPlayerInput,
  endConversation,
  checkStatus,
} from '../services/mantellaApi';

function typingDelay(text: string): Promise<void> {
  const ms = Math.min(600 + text.length * 8, 3000);
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function makeMessage(
  type: ChatMessage['type'],
  content: string,
  sender?: string,
  action?: string | null
): ChatMessage {
  return { id: uuidv4(), type, content, sender, timestamp: new Date(), action };
}

export function useConversation() {
  const [state, setState] = useState<ConversationState>('IDLE');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [mantellaOnline, setMantellaOnline] = useState<boolean | null>(null);
  const [logs, setLogs] = useState<ConversationLog[]>([]);
  const [lastRequest, setLastRequest] = useState<unknown>(null);
  const [lastResponse, setLastResponse] = useState<unknown>(null);
  const sessionRef = useRef<{ player: Player; npcs: NPC[] } | null>(null);

  const addMessage = useCallback((msg: ChatMessage) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  const ping = useCallback(async () => {
    try {
      await checkStatus();
      setMantellaOnline(true);
    } catch {
      setMantellaOnline(false);
    }
  }, []);

  const begin = useCallback(
    async (player: Player, npcs: NPC[]) => {
      setState('CONNECTING');
      setMessages([]);
      sessionRef.current = { player, npcs };

      const payload = {
        player_name: player.name,
        player_race: player.race,
        player_gender: player.gender,
        location: player.location,
        in_game_time: player.in_game_time,
        npcs,
      };

      setLastRequest(payload);

      try {
        const res = await startConversation(payload);
        setLastResponse(res);
        setState('ACTIVE');
        const npcNames = npcs.map((n) => n.name).join(', ');
        addMessage(
          makeMessage(
            'system',
            `Conversa iniciada em ${player.location} · ${player.in_game_time} com ${npcNames}`
          )
        );
      } catch (err) {
        setState('IDLE');
        addMessage(makeMessage('error', `Falha ao conectar: ${(err as Error).message}`));
        setMantellaOnline(false);
      }
    },
    [addMessage]
  );

  const speak = useCallback(
    async (transcript: string, playerName: string) => {
      if (state !== 'ACTIVE') return;
      addMessage(makeMessage('player', transcript, playerName));
      setState('WAITING');

      const payload = { transcript };
      setLastRequest(payload);

      try {
        const res = await sendPlayerInput(payload);
        setLastResponse(res);
        const items = Array.isArray(res) ? res : [res];
        for (const item of items) {
          if (item.npc_response) {
            await typingDelay(item.npc_response);
            addMessage(makeMessage('npc', item.npc_response, item.npc_name, item.action));
          }
        }
        setState('ACTIVE');
      } catch (err) {
        addMessage(makeMessage('error', `Erro ao receber resposta: ${(err as Error).message}`));
        setState('ACTIVE');
      }
    },
    [state, addMessage]
  );

  const end = useCallback(async () => {
    if (state === 'IDLE') return;
    try {
      await endConversation();
    } catch {
      // silently ignore — still end locally
    }

    if (sessionRef.current) {
      const log: ConversationLog = {
        id: uuidv4(),
        startedAt: messages[0]?.timestamp ?? new Date(),
        endedAt: new Date(),
        player: sessionRef.current.player,
        npcs: sessionRef.current.npcs,
        messages,
      };
      setLogs((prev) => [log, ...prev]);
    }

    addMessage(makeMessage('system', 'Conversa encerrada.'));
    setState('ENDED');
    sessionRef.current = null;
  }, [state, messages, addMessage]);

  const reset = useCallback(() => {
    setState('IDLE');
    setMessages([]);
    setLastRequest(null);
    setLastResponse(null);
    sessionRef.current = null;
  }, []);

  return {
    state,
    messages,
    mantellaOnline,
    logs,
    lastRequest,
    lastResponse,
    ping,
    begin,
    speak,
    end,
    reset,
  };
}
