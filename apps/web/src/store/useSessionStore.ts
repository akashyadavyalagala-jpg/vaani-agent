import { create } from 'zustand';

export type SessionState = 
  | 'idle' 
  | 'connecting' 
  | 'listening' 
  | 'user-speaking' 
  | 'thinking' 
  | 'agent-speaking' 
  | 'error';

export interface TranscriptItem {
  id: string;
  role: 'user' | 'agent';
  text: string;
  isPartial: boolean;
}

export interface SessionMetrics {
  vadToFinal?: number;
  finalToLlm?: number;
  llmToTts?: number;
  totalLatency?: number;
}

interface SessionStore {
  state: SessionState;
  transcript: TranscriptItem[];
  metrics: SessionMetrics | null;
  voice: string;
  pace: number;
  agentId: string;
  locale: string;
  handsFree: boolean;
  errorMsg: string | null;

  setState: (state: SessionState) => void;
  setError: (msg: string) => void;
  addTranscript: (item: TranscriptItem) => void;
  updateTranscript: (id: string, text: string, isPartial: boolean) => void;
  setMetrics: (metrics: SessionMetrics) => void;
  setConfig: (config: Partial<Pick<SessionStore, 'voice' | 'pace' | 'agentId' | 'locale' | 'handsFree'>>) => void;
  resetSession: () => void;
}

export const useSessionStore = create<SessionStore>((set) => ({
  state: 'idle',
  transcript: [],
  metrics: null,
  voice: 'kavitha',
  pace: 1.0,
  agentId: 'default',
  locale: 'te-IN',
  handsFree: true,
  errorMsg: null,

  setState: (state) => set({ state, errorMsg: state === 'error' ? undefined : null }),
  setError: (msg) => set({ state: 'error', errorMsg: msg }),
  addTranscript: (item) => set((s) => ({ transcript: [...s.transcript, item] })),
  updateTranscript: (id, text, isPartial) => set((s) => ({
    transcript: s.transcript.map(t => t.id === id ? { ...t, text, isPartial } : t)
  })),
  setMetrics: (metrics) => set({ metrics }),
  setConfig: (config) => set(config),
  resetSession: () => set({ state: 'idle', transcript: [], metrics: null, errorMsg: null }),
}));
