// Client to Server Events
export type ClientEvent =
  | { type: "session.start"; voice?: string; pace?: number; agent_id?: string; locale?: string }
  | { type: "audio.chunk"; seq: number; payload: string } // base64 pcm or opus
  | { type: "audio.end" }
  | { type: "interrupt" }
  | { type: "session.end" }
  | { type: "text.input"; text: string };

// Server to Client Events
export type ServerEvent =
  | { type: "session.ready"; session_id: string }
  | { type: "vad.speech_start" }
  | { type: "stt.partial"; text: string }
  | { type: "stt.final"; text: string; language: string }
  | { type: "llm.delta"; text: string }
  | { type: "agent.state"; state: "LISTENING" | "TRANSCRIBING" | "THINKING" | "SPEAKING" | "IDLE" }
  | { type: "tts.chunk"; seq: number; sentence_id: number; wav_b64: string }
  | { type: "tts.end" }
  | { type: "metrics"; timings: Record<string, number> }
  | { type: "error"; code: string; message: string; retryable: boolean };
