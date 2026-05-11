import type {
  StartConversationPayload,
  PlayerInputPayload,
  MantellaResponse,
  StatusResponse,
  OverrideNPCResponse,
} from '../types/mantella';

const PROXY_BASE = 'http://localhost:8080';
const TIMEOUT_MS = 10_000;

async function fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    return response;
  } finally {
    clearTimeout(id);
  }
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const response = await fetchWithTimeout(`${PROXY_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`HTTP ${response.status}: ${text}`);
  }

  return response.json() as Promise<T>;
}

export async function checkStatus(): Promise<StatusResponse> {
  const response = await fetchWithTimeout(`${PROXY_BASE}/status`);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

export async function startConversation(payload: StartConversationPayload): Promise<unknown> {
  return post('/start_conversation', payload);
}

export async function sendPlayerInput(payload: PlayerInputPayload): Promise<MantellaResponse | MantellaResponse[]> {
  return post<MantellaResponse | MantellaResponse[]>('/player_input', payload);
}

export async function endConversation(): Promise<unknown> {
  return post('/end_conversation', {});
}

export async function fetchOverrideNPCs(): Promise<OverrideNPCResponse> {
  const response = await fetchWithTimeout(`${PROXY_BASE}/override_npcs`);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

export async function getOverridePath(): Promise<{ path: string; exists: boolean; files: string[] }> {
  const response = await fetchWithTimeout(`${PROXY_BASE}/override_path`);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

export async function setOverridePath(path: string): Promise<{ path: string; exists: boolean }> {
  return post('/override_path', { path });
}
