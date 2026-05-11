export type Race =
  | 'Nord'
  | 'Imperial'
  | 'Breton'
  | 'Dunmer'
  | 'Altmer'
  | 'Bosmer'
  | 'Orc'
  | 'Khajiit'
  | 'Argonian'
  | 'Redguard';

export type Gender = 'male' | 'female';

export interface NPC {
  name: string;
  race: Race;
  gender: Gender;
  is_follower: boolean;
  is_enemy: boolean;
  relationship_rank: number; // -4 to 4
  ref_id: string;
  base_id: string;
  voice_type?: string;
  equipment?: string[];
  is_ghost?: boolean;
  is_in_combat?: boolean;
}

export interface Player {
  name: string;
  race: Race;
  gender: Gender;
  location: string;
  in_game_time: string; // "HH:MM"
}

export interface StartConversationPayload {
  player_name: string;
  player_race: string;
  player_gender: string;
  location: string;
  in_game_time: string;
  npcs: NPC[];
}

export interface PlayerInputPayload {
  transcript: string;
}

export interface MantellaResponse {
  npc_response: string;
  npc_name: string;
  action: string | null;
}

export interface StatusResponse {
  status: string;
}

export type MessageType = 'player' | 'npc' | 'system' | 'error';

export interface ChatMessage {
  id: string;
  type: MessageType;
  content: string;
  sender?: string;
  timestamp: Date;
  action?: string | null;
}

export type ConversationState = 'IDLE' | 'CONNECTING' | 'ACTIVE' | 'WAITING' | 'ENDED';

export interface ConversationLog {
  id: string;
  startedAt: Date;
  endedAt?: Date;
  player: Player;
  npcs: NPC[];
  messages: ChatMessage[];
}

export interface NPCPreset {
  id: string;
  label: string;
  npc: NPC;
  suggestedLocation?: string;
}

// NPCs lidos da pasta de override do Mantella
export interface OverrideNPC {
  name: string;
  race: string;
  gender: 'male' | 'female';
  bio: string;
  voice_model: string;
  ref_id: string;
  base_id: string;
  is_follower: boolean;
  is_enemy: boolean;
  relationship_rank: number;
  _source_file: string;
}

export interface OverrideNPCResponse {
  npcs: OverrideNPC[];
  count: number;
  override_path: string;
  path_exists: boolean;
}

// Experiment / questionnaire
export type AppScreen = 'context' | 'chat' | 'questionnaire' | 'done';
export type LikertMode = 'range' | 'classic';

export interface QuestionnaireAnswer {
  questionId: string;
  questionText: string;
  value: number; // 1–7
}

export interface ExperimentResult {
  sessionId: string;
  startedAt: string;
  endedAt: string;
  conversationDuration: number; // seconds
  messageCount: number;
  npcs: string[];
  playerName: string;
  likertMode: LikertMode;
  answers: QuestionnaireAnswer[];
  conversationLog: Array<{ role: string; content: string; timestamp: string }>;
}
